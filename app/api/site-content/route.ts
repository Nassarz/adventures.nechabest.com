import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

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

    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching public site content:', error);
    return NextResponse.json({}, { status: 200 });
  }
}
