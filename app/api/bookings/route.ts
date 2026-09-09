import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { sendEmail, escapeHtml } from '@/lib/email';
import {
  checkRateLimit, getClientIdentifier, sanitizeString, sanitizeEmail,
  sanitizePhone, sanitizePositiveInt, sanitizeNumber,
  isBotRequest, secureJson, checkOrigin,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`booking:${ip}`, { max: 5, windowMs: 10 * 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    if (isBotRequest(body)) return secureJson({ error: 'Invalid submission' }, { status: 400 });

    const fullName = sanitizeString(body.fullName, 100);
    const email = sanitizeEmail(body.email);
    const phone = sanitizePhone(body.phone);
    const tourId = sanitizeString(body.tourId, 100);
    const tourTitle = sanitizeString(body.tourTitle, 200);
    const numberOfPeople = sanitizePositiveInt(body.numberOfPeople, 1, 10000);
    const totalPrice = sanitizeNumber(body.totalPrice);
    const specialRequests = sanitizeString(body.specialRequests, 1000);
    const startDate = sanitizeString(body.startDate, 50);
    const endDate = sanitizeString(body.endDate, 50);

    if (!fullName) return secureJson({ error: 'Full name is required' }, { status: 400 });
    if (!email) return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    if (!startDate) return secureJson({ error: 'Booking start date is required' }, { status: 400 });

    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) return secureJson({ error: 'Invalid booking start date' }, { status: 400 });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (parsedStart < today) return secureJson({ error: 'Booking start date cannot be in the past' }, { status: 400 });

    let parsedEnd: Date | null = null;
    if (endDate) {
      parsedEnd = new Date(endDate);
      if (isNaN(parsedEnd.getTime())) return secureJson({ error: 'Invalid booking end date' }, { status: 400 });
    }

    const db = await getDb();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBookings = await db.collection('bookings').countDocuments({ email, createdAt: { $gte: oneDayAgo } });
    if (recentBookings >= 3) return secureJson({ error: 'You have reached the maximum number of bookings for today.' }, { status: 429 });

    const booking = {
      tourId, tourTitle, fullName, email, phone, numberOfPeople,
      startDate: parsedStart, endDate: parsedEnd, totalPrice, specialRequests,
      status: 'pending', createdAt: new Date(), read: false,
    };

    const result = await db.collection('bookings').insertOne(booking);

    const safeFullName = escapeHtml(fullName);
    const safeTourTitle = escapeHtml(tourTitle);

    sendEmail({
      type: 'bookings', to: email,
      subject: `Booking Request Received: ${tourTitle} - Nechabest Adventures`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
        <h2 style="color:#1A3C34;">Nechabest Adventures</h2>
        <p>Dear <strong>${safeFullName}</strong>,</p>
        <p>Thank you for booking your adventure! We have received your request for <strong>${safeTourTitle}</strong>.</p>
        <p>Our team will contact you within 24 hours to confirm your booking.</p>
      </div>`,
    }).catch(() => {});

    sendEmail({
      type: 'bookings', to: 'info@nechabest.com',
      subject: `[Admin] New Booking for ${tourTitle} from ${fullName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
        <h2 style="color:#1A3C34;">New Booking Request</h2>
        <p><strong>Client:</strong> ${safeFullName}</p>
        <p><strong>Tour:</strong> ${safeTourTitle}</p>
        <p><strong>Date:</strong> ${parsedStart.toLocaleDateString()}</p>
        <p><strong>People:</strong> ${numberOfPeople}</p>
        <p><strong>Total:</strong> $${totalPrice}</p>
      </div>`,
    }).catch(() => {});

    return secureJson({ success: true, id: result.insertedId.toString(), message: 'Booking submitted successfully!' });
  } catch (error) {
    console.error('Error creating booking:', error);
    return secureJson({ error: 'Failed to create booking' }, { status: 500 });
  }
}
