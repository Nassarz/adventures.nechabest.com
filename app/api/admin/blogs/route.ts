import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const blogs = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(
      blogs.map((blog) => ({
        ...blog,
        id: blog._id.toString(),
        image: blog.image || 'https://picsum.photos/seed/blog/1200/800',
        avatar: blog.avatar || `https://picsum.photos/seed/${blog.author || 'author'}/100/100`,
      }))
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
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
    const user = await currentUser();
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const uploaderName = fullName || user?.username || user?.emailAddresses?.[0]?.emailAddress || 'Admin';
    const uploaderImage = user?.imageUrl || `https://picsum.photos/seed/${uploaderName}/100/100`;

    const blog = {
      ...body,
      author: body.author?.trim() || uploaderName,
      avatar: body.avatar || uploaderImage,
      image: body.image || 'https://picsum.photos/seed/blog/1200/800',
      views: Number(body.views || 0),
      likes: Number(body.likes || 0),
      published: body.published ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminCheck.userId,
      createdByEmail: adminCheck.email || user?.emailAddresses?.[0]?.emailAddress || null,
    };

    const result = await db.collection('blogs').insertOne(blog);

    return NextResponse.json({ id: result.insertedId.toString(), ...blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDb();
    const normalizedData = {
      ...updateData,
      image: updateData.image || 'https://picsum.photos/seed/blog/1200/800',
      ...(updateData.likes !== undefined ? { likes: Number(updateData.likes || 0) } : {}),
      ...(updateData.views !== undefined ? { views: Number(updateData.views || 0) } : {}),
    };

    await db.collection('blogs').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...normalizedData, updatedAt: new Date(), updatedBy: adminCheck.userId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('blogs').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
