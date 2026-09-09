import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit, getClientIdentifier, sanitizeString, sanitizeEmail, isBotRequest, secureJson, checkOrigin } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`newsletter:${ip}`, { max: 3, windowMs: 5 * 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    if (isBotRequest(body)) return secureJson({ error: 'Invalid submission' }, { status: 400 });

    const email = sanitizeEmail(body.email);
    const name = sanitizeString(body.name, 100);

    if (!email) return secureJson({ error: 'A valid email address is required' }, { status: 400 });

    const db = await getDb();

    const existing = await db.collection('subscribers').findOne({ email });
    if (existing) return secureJson({ message: 'This email is already subscribed.' }, { status: 409 });

    await db.collection('subscribers').insertOne({
      email, name, subscribedAt: new Date(), status: 'active', source: 'website',
    });

    return secureJson({ success: true, message: 'Successfully subscribed to our newsletter!' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return secureJson({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}
