import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  isValidObjectId,
  secureJson,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`tour-single:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const db = await getDb();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return secureJson({ error: 'Invalid tour ID' }, { status: 400 });
    }

    const tour = await db.collection('tours').findOne({ _id: new ObjectId(id) });

    if (!tour) {
      return secureJson({ error: 'Eco-tour not found' }, { status: 404 });
    }

    return secureJson({
      ...tour,
      id: tour._id.toString(),
      image: tour.image || 'https://iili.io/3ovy0N9.jpg',
      _id: undefined,
    });
  } catch (error) {
    console.error('Error fetching tour:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch tour' }, { status: 500 });
  }
}
