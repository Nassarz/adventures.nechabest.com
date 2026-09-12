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
    const logoUrl = 'https://iili.io/ffrDkkN.png';
    const igIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0idXJsKCNpZykiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImlnIiB4MT0iMCIgeTE9IjQ4IiB4Mj0iNDgiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjA5NDMzIi8+PHN0b3Agb2Zmc2V0PSIyNSUiIHN0b3AtY29sb3I9IiNlNjY4M2MiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2RjMjc0MyIvPjxzdG9wIG9mZnNldD0iNzUlIiBzdG9wLWNvbG9yPSIjY2MyMzY2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYmMxODg4Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHJ4PSI3IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIuNSIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjYuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48Y2lyY2xlIGN4PSIzMyIgY3k9IjE1IiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';
    const fbIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iIzE4NzdmMiIvPjxwYXRoIGQ9Ik0yOSAyNS41aC0zdjEwaC00di0xMGgtMnYtMy41aDJ2LTIuM2MwLTIuOCAxLjItNC40IDQuMy00LjRoMi43djMuNWgtMS43Yy0xLjIgMC0xLjMuNS0xLjMgMS4zdjIuMWgzbC0uNyAzLjV6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';
    const xIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0zNC41IDExaC00LjhsLTUuNSA3LjFMMjEuMiAxMWgtNWw3LjUgOS42TDE2IDM3aDQuOGw1LjItNi44IDQuNCA2LjhoNWwtNy44LTEwLjFMMzQuNSAxMXptLTIuNiAyMS4zTDIxLjcgMTQuNWgxLjhsMTAuMiAxNy44aC0xLjh6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';
    const ttIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0zMyAxNC41Yy0xLjUtLjgtMi41LTIuMy0yLjgtNGgtMy4ydjE1LjhjMCAxLjctMS40IDMuMS0zLjEgMy4xcy0zLjEtMS40LTMuMS0zLjEgMS40LTMuMSAzLjEtMy4xYy4zIDAgLjcuMSAxIC4ydi0zLjRjLS4zIDAtLjctLjEtMS0uMS0zLjUgMC02LjQgMi45LTYuNCA2LjRzMi45IDYuNCA2LjQgNi40IDYuNC0yLjkgNi40LTYuNHYtOC4zYzEuMy45IDIuOCAxLjUgNC41IDEuNXYtMy4yYy0xLjQgMC0yLjYtLjYtMy41LTEuNC0uMS0uMS0uMi0uMS0uMy0uMS0uMyAwLS41LjEtLjcuMnYtLjN6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';
    const waIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iIzI1RDM2NiIvPjxwYXRoIGQ9Ik0zNC42IDEzLjJjLTMtMy03LTQuNi0xMS4yLTQuNi04LjcgMC0xNS44IDcuMS0xNS44IDE1LjggMCAyLjguNyA1LjUgMi4xIDcuOUwxMSAzN2w1LjMtMS40YzIuMyAxLjIgNC44IDEuOSA3LjQgMS45IDguNyAwIDE1LjgtNy4xIDE1LjgtMTUuOCAwLTQuMi0xLjctOC4yLTQuOS0xMC41em0tMTEuMiAyNGMtMi40IDAtNC43LS42LTYuNy0xLjhsLS41LS4zLTQuOCAxLjMgMS4zLTQuNy0uMy0uNWMtMS4yLTItMS45LTQuMy0xLjktNi43IDAtNy4xIDUuOC0xMi45IDEyLjktMTIuOSAzLjUgMCA2LjcgMS4zIDkuMSAzLjcgMi40IDIuNCAzLjcgNS42IDMuNyA5LjEgMCA3LjEtNS44IDEyLjktMTIuOCAxMi45em03LTkuNmMtLjQtLjItMi4zLTEuMS0yLjctMS4zLS40LS4yLS43LS4yLTEgLjJzLTEuMSAxLjMtMS40IDEuNmMtLjMuMy0uNS4zLS45LjEtLjQtLjItMS43LS42LTMuMi0yLTEuMi0xLjEtMi0yLjQtMi4yLTIuOC0uMi0uNCAwLS42LjItLjguMi0uMi40LS41LjYtLjcuMi0uMy4zLS41LjQtLjguMS0uMyAwLS42IDAtLjgtLjEtLjMtMS0yLjQtMS40LTMuMy0uNC0uOS0uNy0uNy0xLS43aC0uOGMtLjMgMC0uOC4xLTEuMi42cy0xLjYgMS42LTEuNiAzLjggMS43IDQuNCAxLjkgNC43Yy4yLjMgMy4zIDUgOCA3IDEuMS43IDIgMS4xIDIuNiAxLjQgMS4xLjQgMi4yLjMgMiAuMi45LS4xIDIuOC0xLjEgMy4yLTIuMi40LTEuMS40LTIgLjMtMi4yLS4xLS4yLS40LS4zLS44LS41eiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=';
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Nechabest Sustainable Adventures" width="180" style="display: block; margin: 0 auto 12px;" />
          <p style="color: #58b05c; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Explore Uganda's Wild Side</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Dear <strong>${safeFullName}</strong>,</p>
        <p>Thank you for booking your adventure with Nechabest Sustainable Adventures! We have received your booking request.</p>
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
                <img src="${igIcon}" width="48" height="48" style="display: block; border-radius: 50%;" alt="Instagram" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://www.facebook.com/people/Nechabest-Sustainable-Initiatives/61576490034369/" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="Facebook">
                <img src="${fbIcon}" width="48" height="48" style="display: block; border-radius: 50%;" alt="Facebook" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://x.com/nechabest" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="X (Twitter)">
                <img src="${xIcon}" width="48" height="48" style="display: block; border-radius: 50%;" alt="X" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://www.tiktok.com/@nechabest" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="TikTok">
                <img src="${ttIcon}" width="48" height="48" style="display: block; border-radius: 50%;" alt="TikTok" />
              </a>
            </td>
            <td align="center" style="padding: 4px;">
              <a href="https://wa.me/256756310029?text=Hello%20Nechabest%20Sustainable%20Adventures!" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" title="WhatsApp">
                <img src="${waIcon}" width="48" height="48" style="display: block; border-radius: 50%;" alt="WhatsApp" />
              </a>
            </td>
          </tr>
        </table>
        <p style="text-align: center; color: #718096; font-size: 12px; margin: 14px 0 0 0;">
          Follow Nechabest for travel inspiration, community stories, and adventure updates.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

        <p style="font-size: 11px; color: #718096; text-align: center; margin: 0;">
          This is an automated booking confirmation receipt from Nechabest Sustainable Adventures.<br />
          Kasangati Town Council, Wakiso District, Uganda
        </p>
      </div>
    `;

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
    const adminNotificationHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://iili.io/ffrDkkN.png" alt="Nechabest Sustainable Adventures" width="180" style="display: block; margin: 0 auto 12px;" />
        </div>
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
