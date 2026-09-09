import { NextRequest } from 'next/server';
import { sendEmail, escapeHtml } from '@/lib/email';
import { checkRateLimit, getClientIdentifier, sanitizeString, sanitizeEmail, sanitizePhone, isBotRequest, secureJson, checkOrigin } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`contact:${ip}`, { max: 3, windowMs: 10 * 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    if (isBotRequest(body)) return secureJson({ error: 'Invalid submission' }, { status: 400 });

    const name = sanitizeString(body.name, 100);
    const email = sanitizeEmail(body.email);
    const phone = sanitizePhone(body.phone);
    const subject = sanitizeString(body.subject, 200);
    const message = sanitizeString(body.message, 5000);

    if (!name) return secureJson({ error: 'Full name is required' }, { status: 400 });
    if (!email) return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    if (!subject) return secureJson({ error: 'Subject is required' }, { status: 400 });
    if (!message || message.length < 10) return secureJson({ error: 'Message must be at least 10 characters long' }, { status: 400 });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    sendEmail({
      type: 'info', to: 'info@nechabest.com',
      subject: `[Website Contact] ${subject} - from ${name}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
        <h2 style="color:#1A3C34;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f7fafc;border:1px solid #edf2f7;border-radius:8px;padding:16px;font-style:italic;">${safeMessage}</div>
      </div>`,
    }).catch(() => {});

    sendEmail({
      type: 'info', to: email,
      subject: `We've received your inquiry: ${subject} - Nechabest Adventures`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
        <h2 style="color:#1A3C34;">Nechabest Adventures</h2>
        <p>Hello <strong>${safeName}</strong>,</p>
        <p>Thank you for contacting us! We have received your inquiry regarding <strong>${safeSubject}</strong>.</p>
        <p>A member of our team will get back to you within 24 hours.</p>
      </div>`,
    }).catch(() => {});

    return secureJson({ success: true, message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return secureJson({ error: 'Failed to process message' }, { status: 500 });
  }
}
