import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  secureJson,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limit: 60 view events per minute per IP (generous for real users, blocks floods)
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`trackview:${ip}`, {
    max: 60,
    windowMs: 60 * 1000,
    message: 'Too many requests.',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();

    const page = sanitizeString(body.page, 500);
    const referrer = sanitizeString(body.referrer, 500);

    if (!page) {
      return secureJson({ error: 'Page path is required' }, { status: 400 });
    }

    const db = await getDb();
    const userAgent = sanitizeString(request.headers.get('user-agent'), 500);

    // Fingerprint: base64(ip + userAgent) — used for deduplication only, raw IP is NOT stored
    const visitorFingerprint = Buffer.from(`${ip}-${userAgent}`).toString('base64');

    // Deduplicate: only track once per visitor per page per 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentView = await db.collection('page_views').findOne({
      page,
      visitorFingerprint,
      timestamp: { $gte: thirtyMinutesAgo },
    });

    if (!recentView) {
      await db.collection('page_views').insertOne({
        page,
        referrer: referrer || null,
        // Store fingerprint for deduplication, NOT raw IP or user-agent (privacy)
        visitorFingerprint,
        timestamp: new Date(),
      });
      return secureJson({ success: true, tracked: true });
    }

    return secureJson({ success: true, tracked: false });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return secureJson({ error: 'Failed to track view' }, { status: 500 });
  }
}
