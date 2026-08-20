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
  const host = request.headers.get('host') || 'nechabest.com';
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

    // Send customer confirmation receipt email (bookings@nechabest.com -> customer)
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a3c34; margin: 0;">Nechabest Sustainable Initiatives</h2>
          <p style="color: #58b05c; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Together for a Greener Future</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Dear <strong>${safeFullName}</strong>,</p>
        <p>Thank you for booking your adventure with Nechabest! We have received your booking request.</p>
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
              <a href="https://www.instagram.com/nechabest/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);" title="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" style="margin: 12px auto; display: block;" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://www.facebook.com/people/Nechabest-Sustainable-Initiatives/61576490034369/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: #1877f2;" title="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" style="margin: 12px auto; display: block;" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://x.com/nechabest" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: #000000;" title="X (Twitter)">
                <svg width="22" height="22" viewBox="0 0 24 24" style="margin: 13px auto; display: block;" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://www.tiktok.com/@nechabest" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: #000000;" title="TikTok">
                <svg width="22" height="22" viewBox="0 0 24 24" style="margin: 13px auto; display: block;" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
                </svg>
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://wa.me/256756310029?text=Hello%20Nechabest%20Sustainable%20Initiatives!" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: #25D366;" title="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" style="margin: 12px auto; display: block;" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"></path>
                </svg>
              </a>
            </td>
          </tr>
        </table>
        <p style="text-align: center; color: #718096; font-size: 12px; margin: 14px 0 0 0;">
          Follow Nechabest for travel inspiration, community stories, and conservation updates.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

        <p style="font-size: 11px; color: #718096; text-align: center; margin: 0;">
          This is an automated booking confirmation receipt from Nechabest.<br />
          Kasangati Town Council, Wakiso District, Uganda
        </p>
      </div>
    `;

    sendEmail({
      type: 'bookings',
      to: email,
      subject: `Booking Request Received: ${tourTitle} - Nechabest`,
      html: clientEmailHtml,
    }).catch((err) => {
      console.error('[Bookings] Client confirmation email failed:', err);
    });

    const safePhone = phone ? escapeHtml(phone) : 'Not provided';
    const safeEmail = escapeHtml(email);

    // Send admin notification email (bookings@nechabest.com -> info@nechabest.com)
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


