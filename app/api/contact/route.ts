import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  isBotRequest,
  secureJson,
  checkOrigin,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // CORS check
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  // Rate limiting: 3 contact submissions per 10 minutes per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`contact:${ip}`, {
    max: 3,
    windowMs: 10 * 60 * 1000,
    message: 'Too many contact messages sent. Please wait a few minutes and try again.',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();

    // Honeypot bot protection
    if (isBotRequest(body)) {
      return secureJson({ error: 'Invalid submission' }, { status: 400 });
    }

    // Sanitize all input fields
    const name = sanitizeString(body.name, 100);
    const email = sanitizeEmail(body.email);
    const phone = sanitizePhone(body.phone);
    const subject = sanitizeString(body.subject, 200);
    const message = sanitizeString(body.message, 5000);

    // Validation
    if (!name) {
      return secureJson({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email) {
      return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (!subject) {
      return secureJson({ error: 'Subject is required' }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return secureJson({ error: 'Message must be at least 10 characters long' }, { status: 400 });
    }

    // 1. Email notification to the admin (info@nechabest.com -> info@nechabest.com)
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #1a3c34; border-bottom: 2px solid #58b05c; padding-bottom: 8px; margin-top: 0;">New Contact Form Submission</h2>
        <p>A message has been received through the Nechabest website contact form. Details below:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568; width: 120px;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Phone:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Subject:</td>
            <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${subject}</td>
          </tr>
        </table>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 16px; font-style: italic; color: #2d3748; white-space: pre-wrap;">${message}</div>
      </div>
    `;

    sendEmail({
      type: 'info',
      to: 'info@nechabest.com',
      subject: `[Website Contact] ${subject} - from ${name}`,
      html: adminEmailHtml,
    }).catch((err) => {
      console.error('[Contact Route] Admin alert email failed:', err);
    });

    // 2. Automated receipt reply to the client (info@nechabest.com -> client)
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a3c34; margin: 0;">Nechabest Sustainable Initiatives</h2>
          <p style="color: #58b05c; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Together for a Greener Future</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for contacting Nechabest! We have received your inquiry regarding <strong>"${subject}"</strong>.</p>
        <p>A member of our team will review your message and get back to you within 24 hours.</p>
        <p><strong>Copy of your message:</strong></p>
        <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 16px; font-style: italic; color: #718096; white-space: pre-wrap;">${message}</div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 11px; color: #718096; text-align: center; margin: 0;">
          This is an automated notification from Nechabest.<br />
          Kasangati Town Council, Wakiso District, Uganda
        </p>
      </div>
    `;

    sendEmail({
      type: 'info',
      to: email,
      subject: `We've received your inquiry: ${subject} - Nechabest`,
      html: clientEmailHtml,
    }).catch((err) => {
      console.error('[Contact Route] Client receipt email failed:', err);
    });

    return secureJson({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you shortly.',
    });
  } catch (error) {
    console.error('Error handling contact form submission:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to process message' }, { status: 500 });
  }
}
