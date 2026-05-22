import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  secureJson,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Rate limit: 120 requests per minute per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`tours:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const db = await getDb();
    const placement = sanitizeString(request.nextUrl.searchParams.get('placement'), 50);

    const filter: Record<string, unknown> = { published: { $ne: false } };
    if (placement === 'home') {
      filter.showOnHome = true;
    }

    const tours = await db
      .collection('tours')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return secureJson(
      tours.map((tour) => ({
        ...tour,
        id: tour._id.toString(),
        image: tour.image || 'https://picsum.photos/seed/tour/800/600',
        showOnHome: Boolean(tour.showOnHome),
        _id: undefined,
      }))
    );
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
