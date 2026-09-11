import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { sendEmail, escapeHtml } from '@/lib/email';
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
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a3c34; margin: 0;">Nechabest Adventures</h2>
          <p style="color: #58b05c; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Explore Uganda's Wild Side</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Dear <strong>${safeFullName}</strong>,</p>
        <p>Thank you for booking your adventure with Nechabest Adventures! We have received your booking request.</p>
        <p><strong>Booking Summary:</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Tour Adventure:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeTourTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Start Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedStart.toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">End Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedEnd ? parsedEnd.toLocaleDateString() : 'Same day'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Number of People:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${numberOfPeople}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Estimated Total:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">$${totalPrice}</td>
          </tr>
          ${safeSpecialRequests ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Special Requests:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeSpecialRequests}</td>
          </tr>
          ` : ''}
        </table>
        <p>Our team will contact you within 24 hours to confirm your booking and coordinate payment and logistics.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

        <!-- Social Media -->
        <p style="text-align: center; color: #718096; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
          Connect With Us
        </p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 4px;">
              <a href="https://www.instagram.com/nechabest/" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="Instagram">
                <img src="https://cdn.simpleicons.org/instagram/white/48/48" width="48" height="48" style="border-radius: 50%; display: block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);" alt="Instagram" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://www.facebook.com/people/Nechabest-Sustainable-Initiatives/61576490034369/" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="Facebook">
                <img src="https://cdn.simpleicons.org/facebook/white/48/48" width="48" height="48" style="border-radius: 50%; display: block; background: #1877f2;" alt="Facebook" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://x.com/nechabest" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="X (Twitter)">
                <img src="https://cdn.simpleicons.org/x/white/48/48" width="48" height="48" style="border-radius: 50%; display: block; background: #000000;" alt="X" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://www.tiktok.com/@nechabest" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="TikTok">
                <img src="https://cdn.simpleicons.org/tiktok/white/48/48" width="48" height="48" style="border-radius: 50%; display: block; background: #000000;" alt="TikTok" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://wa.me/256756310029?text=Hello%20Nechabest%20Adventures!" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="WhatsApp">
                <img src="https://cdn.simpleicons.org/whatsapp/white/48/48" width="48" height="48" style="border-radius: 50%; display: block; background: #25D366;" alt="WhatsApp" />
              </a>
            </td>
          </tr>
        </table>
        <p style="text-align: center; color: #718096; font-size: 12px; margin: 14px 0 0 0;">
          Follow Nechabest for travel inspiration, community stories, and adventure updates.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

        <p style="font-size: 11px; color: #718096; text-align: center; margin: 0;">
          This is an automated booking confirmation receipt from Nechabest Adventures.<br />
          Kasangati Town Council, Wakiso District, Uganda
        </p>
      </div>
    `;

    sendEmail({
      type: 'bookings',
      to: email,
      subject: `Booking Request Received: ${tourTitle} - Nechabest Adventures`,
      html: clientEmailHtml,
    }).catch((err) => {
      console.error('[Bookings] Client confirmation email failed:', err);
    });

    const safePhone = phone ? escapeHtml(phone) : 'Not provided';
    const safeEmail = escapeHtml(email);

    // Send admin notification email
    const adminNotificationHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #1a3c34; border-bottom: 2px solid #58b05c; padding-bottom: 8px; margin-top: 0;">New Booking Request Received</h2>
        <p>A new booking request has been submitted. Details below:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Client Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeFullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Client Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Client Phone:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safePhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Tour Adventure:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeTourTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Start Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedStart.toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">End Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedEnd ? parsedEnd.toLocaleDateString() : 'Same day'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Number of People:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${numberOfPeople}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Estimated Total:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">$${totalPrice}</td>
          </tr>
          ${safeSpecialRequests ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Special Requests:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeSpecialRequests}</td>
          </tr>
          ` : ''}
        </table>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${baseUrl}/admin/bookings" style="background-color: #1a3c34; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Manage Bookings</a>
        </div>
      </div>
    `;

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
