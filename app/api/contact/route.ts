import { NextRequest } from 'next/server';
import { sendEmail, escapeHtml } from '@/lib/email';
import { buildContactAdminEmail, buildContactReplyEmail } from '@/lib/emailTemplates';
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
      html: buildContactAdminEmail({ safeName, safeEmail, safeSubject, safeMessage }),
    }).catch(() => {});

    sendEmail({
      type: 'info', to: email,
      subject: `We've received your inquiry: ${subject} - Nechabest Sustainable Adventures`,
      html: buildContactReplyEmail({ safeName, safeSubject }),
    }).catch(() => {});

    return secureJson({ success: true, message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return secureJson({ error: 'Failed to process message' }, { status: 500 });
  }
}
