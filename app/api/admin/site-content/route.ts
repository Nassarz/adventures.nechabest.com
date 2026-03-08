import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import { SITE_CONTENT_DEFAULTS } from '@/lib/siteContentDefaults';

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
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
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
      filter.$or = [
        { key: { $regex: query, $options: 'i' } },
        { label: { $regex: query, $options: 'i' } },
        { section: { $regex: query, $options: 'i' } },
      ];
    }

    const rows = await db
      .collection('site_content')
      .find(filter)
      .sort({ page: 1, section: 1, key: 1 })
      .toArray();

    return NextResponse.json(rows.map((row) => ({ ...row, id: row._id.toString() })));
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Failed to fetch site content' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { id, value } = body;

    if (!id || typeof value !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('site_content').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          value,
          updatedAt: new Date(),
          updatedBy: adminCheck.userId,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating site content:', error);
    return NextResponse.json({ error: 'Failed to update site content' }, { status: 500 });
  }
}
