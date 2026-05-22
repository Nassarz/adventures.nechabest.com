import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  sanitizeEmail,
  isBotRequest,
  secureJson,
  checkOrigin,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // CORS
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  // Rate limit: 3 subscribe attempts per 5 minutes per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`newsletter:${ip}`, {
    max: 3,
    windowMs: 5 * 60 * 1000,
    message: 'Too many subscription attempts. Please wait a few minutes.',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();

    // Bot protection
    if (isBotRequest(body)) {
      return secureJson({ error: 'Invalid submission' }, { status: 400 });
    }

    const email = sanitizeEmail(body.email);
    const name = sanitizeString(body.name, 100);

    if (!email) {
      return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    }

    const db = await getDb();

    // Check if already subscribed — return 409 so clients can distinguish from success
    const existing = await db.collection('subscribers').findOne({ email });
    if (existing) {
      return secureJson(
        { message: 'This email is already subscribed to our newsletter.' },
        { status: 409 }
      );
    }

    await db.collection('subscribers').insertOne({
      email,
      name,
      subscribedAt: new Date(),
      status: 'active',
      source: 'website',
    });

    // Send notification email via Formspree (fire-and-forget)
    sendNewsletterNotification({ email, name }).catch((err) => {
      console.error('[Newsletter] Email notification failed:', err instanceof Error ? err.message : 'unknown');
    });

    return secureJson({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}

/**
 * Notify admin of new newsletter subscriber via Formspree.
 */
async function sendNewsletterNotification(data: {
  email: string;
  name: string;
}): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ENDPOINT;
  if (!endpoint || !endpoint.startsWith('https://formspree.io')) return;

  const payload = {
    _subject: `New Newsletter Subscriber – ${data.email}`,
    type: 'newsletter_subscription',
    subscriberEmail: data.email,
    subscriberName: data.name || 'Not provided',
    subscribedAt: new Date().toISOString(),
    message: `New newsletter subscriber:\n\nEmail: ${data.email}\nName: ${data.name || 'Not provided'}\nDate: ${new Date().toLocaleString()}`,
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
