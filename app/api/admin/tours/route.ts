import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import {
  isValidObjectId,
  secureJson,
  sanitizeString,
  sanitizeNumber,
  sanitizePositiveInt,
  checkAdminRateLimit,
} from '@/lib/apiSecurity';

// Whitelist of fields that can be updated on a tour
const TOUR_UPDATABLE_FIELDS = [
  'title', 'description', 'location', 'price', 'duration',
  'image', 'maxPeople', 'group', 'published', 'showOnHome',
  'highlights', 'includes', 'excludes', 'itinerary', 'category',
] as const;

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const tours = await db.collection('tours').find({}).sort({ createdAt: -1 }).toArray();

    return secureJson(
      tours.map((tour) => {
        const { _id, ...rest } = tour;
        return { ...rest, id: _id.toString() };
      })
    );
  } catch (error) {
    console.error('Error fetching tours:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch tours' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limit admin actions
    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const body = await request.json();
    const db = await getDb();

    // Whitelist fields on create
    const tour = {
      title: sanitizeString(body.title, 200),
      description: sanitizeString(body.description, 5000),
      location: sanitizeString(body.location, 200),
      price: sanitizeNumber(body.price),
      duration: sanitizeString(body.duration, 100),
      image: sanitizeString(body.image, 2048),
      maxPeople: sanitizePositiveInt(body.maxPeople, 1, 500),
      group: sanitizeString(body.group, 100),
      published: body.published ?? true,
      showOnHome: Boolean(body.showOnHome),
      highlights: Array.isArray(body.highlights) ? body.highlights.map((h: unknown) => sanitizeString(h, 500)) : [],
      includes: Array.isArray(body.includes) ? body.includes.map((i: unknown) => sanitizeString(i, 500)) : [],
      excludes: Array.isArray(body.excludes) ? body.excludes.map((e: unknown) => sanitizeString(e, 500)) : [],
      itinerary: sanitizeString(body.itinerary, 10000),
      category: sanitizeString(body.category, 100),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminCheck.userId,
    };

    if (!tour.title) {
      return secureJson({ error: 'Tour title is required' }, { status: 400 });
    }

    const result = await db.collection('tours').insertOne(tour);

    return secureJson({ id: result.insertedId.toString(), ...tour });
  } catch (error) {
    console.error('Error creating tour:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to create tour' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limit admin actions
    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing tour ID' }, { status: 400 });
    }

    const db = await getDb();

    // Whitelist: only allow known updatable fields (prevents mass assignment)
    const safeUpdate: Record<string, unknown> = {};
    for (const field of TOUR_UPDATABLE_FIELDS) {
      if (!(field in updateData)) continue;
      if (field === 'showOnHome' || field === 'published') {
        safeUpdate[field] = Boolean(updateData[field]);
      } else if (field === 'price') {
        safeUpdate[field] = sanitizeNumber(updateData[field]);
      } else if (field === 'maxPeople') {
        safeUpdate[field] = sanitizePositiveInt(updateData[field], 1, 500);
      } else if (field === 'highlights' || field === 'includes' || field === 'excludes') {
        safeUpdate[field] = Array.isArray(updateData[field])
          ? (updateData[field] as unknown[]).map((v) => sanitizeString(v, 500))
          : [];
      } else {
        safeUpdate[field] = sanitizeString(updateData[field], field === 'description' || field === 'itinerary' ? 10000 : 2048);
      }
    }

    if (Object.keys(safeUpdate).length === 0) {
      return secureJson({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await db.collection('tours').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...safeUpdate, updatedAt: new Date(), updatedBy: adminCheck.userId } }
    );

    if (result.matchedCount === 0) {
      return secureJson({ error: 'Tour not found' }, { status: 404 });
    }

    return secureJson({ success: true, message: 'Tour updated successfully' });
  } catch (error) {
    console.error('Error updating tour:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to update tour' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limit admin actions
    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing tour ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('tours').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return secureJson({ error: 'Tour not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error deleting tour:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to delete tour' }, { status: 500 });
  }
}
