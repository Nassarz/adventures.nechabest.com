import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import {
  isValidObjectId,
  isValidHttpsUrl,
  secureJson,
  sanitizeString,
  sanitizePositiveInt,
  sanitizeEnum,
  checkAdminRateLimit,
} from '@/lib/apiSecurity';

const BANNER_UPDATABLE_FIELDS = [
  'title',
  'subtitle',
  'description',
  'image',
  'ctaLabel',
  'ctaType',
  'ctaLink',
  'whatsappMessage',
  'showOnOpen',
  'active',
  'order',
] as const;

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const banners = await db.collection('banners').find({}).sort({ order: 1, createdAt: -1 }).toArray();

    return secureJson(
      banners.map((banner) => ({
        ...banner,
        id: banner._id.toString(),
        _id: undefined,
      }))
    );
  } catch (error) {
    console.error('Error fetching banners:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const body = await request.json();

    const banner = {
      title: sanitizeString(body.title, 200),
      subtitle: sanitizeString(body.subtitle, 300),
      description: sanitizeString(body.description, 1000),
      image: sanitizeString(body.image, 2048),
      ctaLabel: sanitizeString(body.ctaLabel, 100) || 'Learn More',
      ctaType: sanitizeEnum<'link' | 'whatsapp'>(body.ctaType, ['link', 'whatsapp']) || 'link',
      ctaLink: sanitizeString(body.ctaLink, 2048),
      whatsappMessage: sanitizeString(body.whatsappMessage, 2000),
      showOnOpen: Boolean(body.showOnOpen),
      active: body.active === undefined ? true : Boolean(body.active),
      order: sanitizePositiveInt(body.order, 0, 100000),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminCheck.userId,
    };

    if (!banner.title) {
      return secureJson({ error: 'Banner title is required' }, { status: 400 });
    }

    if (!banner.image || !isValidHttpsUrl(banner.image)) {
      return secureJson({ error: 'A valid HTTPS image URL is required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('banners').insertOne(banner);

    return secureJson({ id: result.insertedId.toString(), ...banner });
  } catch (error) {
    console.error('Error creating banner:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to create banner' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing banner ID' }, { status: 400 });
    }

    const db = await getDb();

    const safeUpdate: Record<string, unknown> = {};
    for (const field of BANNER_UPDATABLE_FIELDS) {
      if (!(field in updateData)) continue;
      if (field === 'showOnOpen' || field === 'active') {
        safeUpdate[field] = Boolean(updateData[field]);
      } else if (field === 'order') {
        safeUpdate[field] = sanitizePositiveInt(updateData[field], 0, 100000);
      } else if (field === 'ctaType') {
        safeUpdate[field] = sanitizeEnum<'link' | 'whatsapp'>(updateData[field], ['link', 'whatsapp']) || 'link';
      } else {
        safeUpdate[field] = sanitizeString(updateData[field], field === 'whatsappMessage' ? 2000 : field === 'description' ? 1000 : 2048);
      }
    }

    if (Object.keys(safeUpdate).length === 0) {
      return secureJson({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await db.collection('banners').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...safeUpdate, updatedAt: new Date(), updatedBy: adminCheck.userId } }
    );

    if (result.matchedCount === 0) {
      return secureJson({ error: 'Banner not found' }, { status: 404 });
    }

    return secureJson({ success: true, message: 'Banner updated successfully' });
  } catch (error) {
    console.error('Error updating banner:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing banner ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('banners').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return secureJson({ error: 'Banner not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to delete banner' }, { status: 500 });
  }
}