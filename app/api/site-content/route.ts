import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  secureJson,
} from '@/lib/apiSecurity';

export async function GET(request: NextRequest) {
  // Rate limit: 120 requests per minute per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`sitecontent:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { searchParams } = new URL(request.url);
    const page = sanitizeString(searchParams.get('page'), 100);

    const db = await getDb();
    const filter: Record<string, string> = {};

    if (page && page !== 'all') {
      filter.page = page;
    }

    const rows = await db
      .collection('site_content')
      .find(filter)
      .project({ key: 1, value: 1, _id: 0 })
      .toArray();

    const content = rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    const res = secureJson(content);
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res;
  } catch (error) {
    console.error('Error fetching public site content:', error);
    return NextResponse.json({}, { status: 200 });
  }
}
