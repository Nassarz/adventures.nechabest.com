import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeEmail,
  isBotRequest,
  secureJson,
  checkOrigin,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // CORS check
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  // Rate limit: 5 unsubscribe attempts per 5 minutes per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`unsubscribe:${ip}`, {
    max: 5,
    windowMs: 5 * 60 * 1000,
    message: 'Too many requests. Please wait a few minutes.',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();

    // Bot protection
    if (isBotRequest(body)) {
      return secureJson({ error: 'Invalid submission' }, { status: 400 });
    }

    const email = sanitizeEmail(body.email);

    if (!email) {
      return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    }

    const db = await getDb();

    // Check if subscriber exists
    const subscriber = await db.collection('subscribers').findOne({ email });
    if (!subscriber) {
      return secureJson({ error: 'This email is not subscribed to our newsletter.' }, { status: 404 });
    }

    // Update subscriber status to 'unsubscribed'
    await db.collection('subscribers').updateOne(
      { email },
      {
        $set: {
          status: 'unsubscribed',
          unsubscribedAt: new Date(),
        },
      }
    );

    return secureJson({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    });
  } catch (error) {
    console.error('Error unsubscribing:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to unsubscribe. Please try again.' }, { status: 500 });
  }
}
