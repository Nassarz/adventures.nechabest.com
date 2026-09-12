import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { sendEmail, escapeHtml } from '@/lib/email';
import { buildBookingClientEmail, buildBookingAdminEmail } from '@/lib/emailTemplates';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizePositiveInt,
  sanitizeNumber,
  isBotRequest,
  secureJson,
  checkOrigin,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const host = request.headers.get('host') || 'adventures.nechabest.com';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  // CORS – only accept requests from our own origin
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  // Rate limit: 20 bookings per 10 minutes per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`booking:${ip}`, {
    max: 20,
    windowMs: 10 * 60 * 1000,
    message: 'Too many booking attempts. Please wait a few minutes and try again.',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();

    // Bot protection
    if (isBotRequest(body)) {
      return secureJson({ error: 'Invalid submission' }, { status: 400 });
    }

    // Sanitize & validate all inputs
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

    // Required field validation
    if (!fullName) {
      return secureJson({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email) {
      return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (!startDate) {
      return secureJson({ error: 'Booking start date is required' }, { status: 400 });
    }

    // Validate booking start date is not in the past and not too far in the future
    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) {
      return secureJson({ error: 'Invalid booking start date' }, { status: 400 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedStart < today) {
      return secureJson({ error: 'Booking start date cannot be in the past' }, { status: 400 });
    }
    // Maximum booking window: 3 years in the future
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 3);
    if (parsedStart > maxDate) {
      return secureJson({ error: 'Booking start date cannot be more than 3 years in the future' }, { status: 400 });
    }

    // Validate end date if provided: must be valid and not before the start date
    let parsedEnd: Date | null = null;
    if (endDate) {
      parsedEnd = new Date(endDate);
      if (isNaN(parsedEnd.getTime())) {
        return secureJson({ error: 'Invalid booking end date' }, { status: 400 });
      }
      parsedEnd.setHours(0, 0, 0, 0);
      const startAtMidnight = new Date(parsedStart);
      startAtMidnight.setHours(0, 0, 0, 0);
      if (parsedEnd < startAtMidnight) {
        return secureJson({ error: 'Booking end date cannot be before the start date' }, { status: 400 });
      }
      if (parsedEnd > maxDate) {
        return secureJson({ error: 'Booking end date cannot be more than 3 years in the future' }, { status: 400 });
      }
    }

    const db = await getDb();

    // Per-email rate limit: 3 bookings per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBookings = await db.collection('bookings').countDocuments({
      email,
      createdAt: { $gte: oneDayAgo },
    });
    if (recentBookings >= 3) {
      return secureJson(
        { error: 'You have reached the maximum number of bookings for today. Please contact us directly.' },
        { status: 429 }
      );
    }

    const booking = {
      tourId,
      tourTitle,
      fullName,
      email,
      phone,
      numberOfPeople,
      startDate: parsedStart,
      endDate: parsedEnd,
      bookingDate: parsedStart,
      totalPrice,
      specialRequests,
      status: 'pending',
      createdAt: new Date(),
      read: false,
    };

    const result = await db.collection('bookings').insertOne(booking);

    // Escape all user-supplied data before injecting into HTML to prevent XSS
    const safeFullName = escapeHtml(fullName);
    const safeTourTitle = escapeHtml(tourTitle);
    const safeSpecialRequests = specialRequests ? escapeHtml(specialRequests) : '';

    // Send customer confirmation receipt email
    const clientEmailHtml = buildBookingClientEmail({
      fullName: safeFullName,
      tourTitle: safeTourTitle,
      parsedStart,
      parsedEnd,
      numberOfPeople,
      totalPrice,
      safeSpecialRequests,
    });

    sendEmail({
      type: 'bookings',
      to: email,
      subject: `Booking Request Received: ${tourTitle} - Nechabest Sustainable Adventures`,
      html: clientEmailHtml,
    }).catch((err) => {
      console.error('[Bookings] Client confirmation email failed:', err);
    });

    const safePhone = phone ? escapeHtml(phone) : 'Not provided';
    const safeEmail = escapeHtml(email);

    // Send admin notification email
    const adminNotificationHtml = buildBookingAdminEmail({
      safeFullName,
      safeEmail,
      safePhone,
      safeTourTitle,
      parsedStart,
      parsedEnd,
      numberOfPeople,
      totalPrice,
      safeSpecialRequests,
    });

    sendEmail({
      type: 'bookings',
      to: 'info@nechabest.com',
      subject: `[Admin Alert] New Booking for ${tourTitle} from ${fullName}`,
      html: adminNotificationHtml,
    }).catch((err) => {
      console.error('[Bookings] Admin notification email failed:', err);
    });

    return secureJson({
      success: true,
      id: result.insertedId.toString(),
      message: 'Booking submitted successfully! We will contact you shortly.',
    });
  } catch (error) {
    console.error('Error creating booking:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to create booking' }, { status: 500 });
  }
}
