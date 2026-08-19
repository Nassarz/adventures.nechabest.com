import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import { SITE_CONTENT_DEFAULTS } from '@/lib/siteContentDefaults';
import { isValidObjectId, secureJson, sanitizeString, checkAdminRateLimit } from '@/lib/apiSecurity';

async function ensureSiteContentDefaults() {
  const db = await getDb();
  const collection = db.collection('site_content');

  await collection.createIndex({ key: 1 }, { unique: true });

  await Promise.all(
    SITE_CONTENT_DEFAULTS.map((item) =>
      collection.updateOne(
        { key: item.key },
        {
          $setOnInsert: {
            ...item,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await ensureSiteContentDefaults();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const query = searchParams.get('q');

    const db = await getDb();
    const filter: Record<string, unknown> = {};

    if (page && page !== 'all') {
      filter.page = page;
    }

    if (query) {
      // Escape special regex chars to prevent ReDoS (regex injection) attacks
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { key: { $regex: escapedQuery, $options: 'i' } },
        { label: { $regex: escapedQuery, $options: 'i' } },
        { section: { $regex: escapedQuery, $options: 'i' } },
      ];
    }

    const rows = await db
      .collection('site_content')
      .find(filter)
      .sort({ page: 1, section: 1, key: 1 })
      .toArray();

    return secureJson(rows.map((row) => ({ ...row, id: row._id.toString() })));
  } catch (error) {
    console.error('Error fetching site content:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch site content' }, { status: 500 });
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
    const { id, value } = body;

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing content ID' }, { status: 400 });
    }

    if (typeof value !== 'string') {
      return secureJson({ error: 'Value must be a string' }, { status: 400 });
    }

    const sanitizedValue = sanitizeString(value, 5000);

    const db = await getDb();
    const result = await db.collection('site_content').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          value: sanitizedValue,
          updatedAt: new Date(),
          updatedBy: adminCheck.userId,
        },
      }
    );

    if (result.matchedCount === 0) {
      return secureJson({ error: 'Content item not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error updating site content:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to update site content' }, { status: 500 });
  }
}
