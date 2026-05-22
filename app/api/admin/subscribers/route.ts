import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import { isValidObjectId, secureJson } from '@/lib/apiSecurity';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const subscribers = await db.collection('subscribers').find({}).sort({ subscribedAt: -1 }).toArray();

    return secureJson(
      subscribers.map((subscriber) => ({ ...subscriber, id: subscriber._id.toString() }))
    );
  } catch (error) {
    console.error('Error fetching subscribers:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return secureJson({ error: 'Invalid or missing subscriber ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('subscribers').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return secureJson({ error: 'Subscriber not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error deleting subscriber:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
