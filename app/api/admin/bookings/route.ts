import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
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

    return NextResponse.json(
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
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date(), updatedBy: adminCheck.userId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('bookings').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
