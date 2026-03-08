import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const placement = request.nextUrl.searchParams.get('placement');

    const filter: Record<string, unknown> = { published: { $ne: false } };
    if (placement === 'home') {
      filter.showOnHome = true;
    }
    if (placement === 'eco') {
      filter.showOnHome = { $ne: true };
    }

    const tours = await db
      .collection('tours')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
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
    // Keep public pages operational even if the database is temporarily unavailable.
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
