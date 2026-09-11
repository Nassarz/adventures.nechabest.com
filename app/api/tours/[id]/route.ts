import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit, getClientIdentifier, secureJson, isValidObjectId } from '@/lib/apiSecurity';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`tours:${ip}`, { max: 120, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return secureJson({ error: 'Invalid tour ID' }, 400);
    }

    const db = await getDb();
    const tour = await db.collection('tours').findOne({ _id: new ObjectId(id) });

    if (!tour) {
      return secureJson({ error: 'Tour not found' }, 404);
    }

    return secureJson({
      ...tour,
      id: tour._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return secureJson({ error: 'Failed to fetch tour' }, 500);
  }
}
