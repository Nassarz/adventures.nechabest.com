import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import {
  isValidObjectId,
  secureJson,
  sanitizeString,
  sanitizeEnum,
  checkAdminRateLimit,
} from '@/lib/apiSecurity';

const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();

    const tourTitles = Array.from(new Set(
      bookings
        .map((booking) => (booking.tourTitle || booking.tourName || '').toString().trim())
        .filter(Boolean)
    ));

    const tours = tourTitles.length > 0
      ? await db.collection('tours').find({ title: { $in: tourTitles } }).toArray()
      : [];

    const priceByTitle = new Map<string, number>();
    for (const tour of tours) {
      const rawPrice = tour.price;
      let normalizedPrice = 0;

      if (typeof rawPrice === 'number') {
        normalizedPrice = rawPrice;
      } else if (typeof rawPrice === 'string') {
        const parsed = Number(rawPrice.replace(/[^\d.]/g, ''));
        normalizedPrice = Number.isFinite(parsed) ? parsed : 0;
      }

      priceByTitle.set((tour.title || '').toString().trim(), normalizedPrice);
    }

    return secureJson(
      bookings.map((booking) => {
        const customerName = booking.customerName || booking.fullName || '';
        const tourName = booking.tourName || booking.tourTitle || '';
        const date = booking.date || booking.bookingDate || booking.createdAt || null;
        const participants = Number.isFinite(booking.participants)
          ? booking.participants
          : Number.isFinite(booking.numberOfPeople)
            ? booking.numberOfPeople
            : 0;

        const storedTotalPrice = Number.isFinite(Number(booking.totalPrice)) ? Number(booking.totalPrice) : 0;
        const inferredTourPrice = priceByTitle.get((tourName || '').toString().trim()) || 0;
        const totalPrice = storedTotalPrice > 0 ? storedTotalPrice : inferredTourPrice * participants;

        const normalizedStatus = typeof booking.status === 'string'
          ? `${booking.status.charAt(0).toUpperCase()}${booking.status.slice(1).toLowerCase()}`
          : 'Pending';

        return {
          ...booking,
          id: booking._id.toString(),
          customerName,
          tourName,
          date,
          participants,
          totalPrice,
          status: normalizedStatus,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return secureJson({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limit admin actions
    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing booking ID' }, { status: 400 });
    }

    // Whitelist allowed update fields to prevent mass-assignment
    const safeUpdate: Record<string, unknown> = {};

    if ('status' in updateData) {
      const status = sanitizeEnum(updateData.status, BOOKING_STATUSES);
      if (!status) {
        return secureJson({ error: 'Invalid status value. Must be pending, confirmed, or cancelled.' }, { status: 400 });
      }
      safeUpdate.status = status;
    }

    if ('read' in updateData) {
      safeUpdate.read = Boolean(updateData.read);
    }

    if ('notes' in updateData) {
      // Sanitize notes to prevent injection
      safeUpdate.notes = sanitizeString(updateData.notes, 2000);
    }

    if (Object.keys(safeUpdate).length === 0) {
      return secureJson({ error: 'No valid fields to update' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...safeUpdate, updatedAt: new Date(), updatedBy: adminCheck.userId } }
    );

    if (result.matchedCount === 0) {
      return secureJson({ error: 'Booking not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error updating booking:', error);
    return secureJson({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limit admin actions
    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing booking ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('bookings').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return secureJson({ error: 'Booking not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return secureJson({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
