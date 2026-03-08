import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const media = await db.collection('media').find({}).sort({ uploadDate: -1 }).toArray();

    return NextResponse.json(media.map((item) => ({ ...item, id: item._id.toString() })));
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const db = await getDb();

    const mediaDoc = {
      filename: body.filename,
      url: body.url,
      uploadDate: new Date().toISOString().split('T')[0],
      size: body.size || '2.4 MB',
      type: body.type || 'Image',
      uploadedBy: adminCheck.userId,
    };

    const result = await db.collection('media').insertOne(mediaDoc);
    return NextResponse.json({ id: result.insertedId.toString(), ...mediaDoc });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const db = await getDb();
    await db.collection('media').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
