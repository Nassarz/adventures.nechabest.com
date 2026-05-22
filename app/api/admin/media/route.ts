import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import {
  isValidObjectId,
  secureJson,
  sanitizeString,
  isValidHttpsUrl,
  checkAdminRateLimit,
} from '@/lib/apiSecurity';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const media = await db.collection('media').find({}).sort({ uploadDate: -1 }).toArray();

    return secureJson(media.map((item) => ({ ...item, id: item._id.toString() })));
  } catch (error) {
    console.error('Error fetching media:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch media' }, { status: 500 });
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

    const filename = sanitizeString(body.filename, 255);
    const url = sanitizeString(body.url, 2048);
    const size = sanitizeString(body.size, 20) || 'Unknown';
    const type = sanitizeString(body.type, 50) || 'Image';

    if (!filename) {
      return secureJson({ error: 'Filename is required' }, { status: 400 });
    }

    // Validate URL is HTTPS to prevent storing malicious URLs
    if (!url || !isValidHttpsUrl(url)) {
      return secureJson({ error: 'A valid HTTPS URL is required' }, { status: 400 });
    }

    const mediaDoc = {
      filename,
      url,
      uploadDate: new Date().toISOString().split('T')[0],
      size,
      type,
      uploadedBy: adminCheck.userId,
    };

    const result = await db.collection('media').insertOne(mediaDoc);
    return secureJson({ id: result.insertedId.toString(), ...mediaDoc });
  } catch (error) {
    console.error('Error creating media:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to create media' }, { status: 500 });
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
      return secureJson({ error: 'Invalid or missing media ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('media').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return secureJson({ error: 'Media not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to delete media' }, { status: 500 });
  }
}
