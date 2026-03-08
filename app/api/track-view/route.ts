import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Track page views
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, referrer } = body;

    if (!page) {
      return NextResponse.json({ error: 'Page path is required' }, { status: 400 });
    }

    const db = await getDb();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Create a unique visitor fingerprint (IP + User Agent hash)
    const visitorFingerprint = Buffer.from(`${ip}-${userAgent}`).toString('base64');

    // Check if this visitor has viewed this page in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentView = await db.collection('page_views').findOne({
      page,
      visitorFingerprint,
      timestamp: { $gte: thirtyMinutesAgo },
    });

    // Only track if no recent view from this visitor
    if (!recentView) {
      await db.collection('page_views').insertOne({
        page,
        referrer: referrer || null,
        userAgent,
        ip,
        visitorFingerprint,
        timestamp: new Date(),
      });

      return NextResponse.json({ success: true, tracked: true });
    }

    return NextResponse.json({ success: true, tracked: false, message: 'Recent view detected' });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
