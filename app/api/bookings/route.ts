import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
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
  // CORS – only accept requests from our own origin
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  // Rate limit: 5 bookings per 10 minutes per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`booking:${ip}`, {
    max: 5,
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
    const numberOfPeople = sanitizePositiveInt(body.numberOfPeople, 1, 100);
    const totalPrice = sanitizeNumber(body.totalPrice);
    const specialRequests = sanitizeString(body.specialRequests, 1000);
    const bookingDate = sanitizeString(body.bookingDate, 50);

    // Required field validation
    if (!fullName) {
      return secureJson({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email) {
      return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (!bookingDate) {
      return secureJson({ error: 'Booking date is required' }, { status: 400 });
    }

    // Validate booking date is not in the past and not too far in the future
    const parsedDate = new Date(bookingDate);
    if (isNaN(parsedDate.getTime())) {
      return secureJson({ error: 'Invalid booking date' }, { status: 400 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return secureJson({ error: 'Booking date cannot be in the past' }, { status: 400 });
    }
    // Maximum booking window: 3 years in the future
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 3);
    if (parsedDate > maxDate) {
      return secureJson({ error: 'Booking date cannot be more than 3 years in the future' }, { status: 400 });
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
      bookingDate: parsedDate,
      totalPrice,
      specialRequests,
      status: 'pending',
      createdAt: new Date(),
      read: false,
    };

    const result = await db.collection('bookings').insertOne(booking);

    // Send customer confirmation email via Formspree (fire-and-forget, non-blocking)
    sendCustomerConfirmationEmail({
      fullName,
      email,
      tourTitle,
      bookingDate,
      numberOfPeople,
      totalPrice,
      bookingId: result.insertedId.toString(),
    }).catch((err) => {
      // Log error but don't fail the booking
      console.error('[Bookings] Customer confirmation email failed:', err instanceof Error ? err.message : 'unknown');
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

/**
 * Send a booking confirmation email to the customer via Formspree.
 * Uses the contact endpoint with a structured subject so Formspree
 * routes it to the configured email address.
 */
async function sendCustomerConfirmationEmail(data: {
  fullName: string;
  email: string;
  tourTitle: string;
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  bookingId: string;
}): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_BOOKING_ENDPOINT;
  if (!endpoint || !endpoint.startsWith('https://formspree.io')) return;

  const formattedDate = (() => {
    try {
      return new Date(data.bookingDate).toLocaleDateString('en-UG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return data.bookingDate;
    }
  })();

  const payload = {
    _subject: `Booking Confirmation – ${data.tourTitle}`,
    _replyto: 'info@nechabest.com',
    // Formspree sends this to the form's configured email AND to _replyto
    // We include the customer email in the body so admin can reply to them
    type: 'booking_confirmation',
    bookingId: data.bookingId,
    customerName: data.fullName,
    customerEmail: data.email,
    tour: data.tourTitle,
    date: formattedDate,
    numberOfPeople: data.numberOfPeople,
    estimatedTotal: `$${data.totalPrice}`,
    message: [
      `Dear ${data.fullName},`,
      '',
      `Thank you for booking the "${data.tourTitle}" tour with Nechabest Sustainable Initiatives!`,
      '',
      `Booking Details:`,
      `  Tour: ${data.tourTitle}`,
      `  Date: ${formattedDate}`,
      `  Number of People: ${data.numberOfPeople}`,
      `  Estimated Total: $${data.totalPrice}`,
      `  Booking Reference: ${data.bookingId}`,
      '',
      `Our team will contact you within 24 hours at ${data.email} to confirm your booking and arrange payment.`,
      '',
      `If you have any questions, please reply to this email or contact us at info@nechabest.com`,
      '',
      `Best regards,`,
      `Nechabest Sustainable Initiatives Team`,
    ].join('\n'),
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });

  if (!response.ok) {
    throw new Error(`Formspree responded with ${response.status}`);
  }
}
