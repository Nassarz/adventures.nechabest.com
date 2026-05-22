import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import {
  isValidObjectId,
  secureJson,
  sanitizeString,
  sanitizeNumber,
  checkAdminRateLimit,
} from '@/lib/apiSecurity';

// Whitelist of fields that can be updated on a blog post
const BLOG_UPDATABLE_FIELDS = [
  'title', 'content', 'excerpt', 'author', 'avatar',
  'image', 'tags', 'published', 'category',
] as const;

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const blogs = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray();

    return secureJson(
      blogs.map((blog) => ({
        ...blog,
        id: blog._id.toString(),
        image: blog.image || 'https://picsum.photos/seed/blog/1200/800',
        avatar: blog.avatar || `https://picsum.photos/seed/${blog.author || 'author'}/100/100`,
      }))
    );
  } catch (error) {
    console.error('Error fetching blogs:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch blogs' }, { status: 500 });
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
    const uploaderName = sanitizeString(body.author, 100) || adminCheck.email || 'Admin';
    const uploaderImage = body.avatar || `https://picsum.photos/seed/${String(uploaderName)}/100/100`;

    const blog = {
      title: sanitizeString(body.title, 300),
      content: sanitizeString(body.content, 50000),
      excerpt: sanitizeString(body.excerpt, 500),
      author: uploaderName,
      avatar: sanitizeString(body.avatar || uploaderImage, 2048),
      image: sanitizeString(body.image || 'https://picsum.photos/seed/blog/1200/800', 2048),
      tags: Array.isArray(body.tags) ? body.tags.map((t: unknown) => sanitizeString(t, 50)) : [],
      category: sanitizeString(body.category, 100),
      views: 0,
      likes: 0,
      published: body.published ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminCheck.userId,
      createdByEmail: adminCheck.email || null,
    };

    if (!blog.title) {
      return secureJson({ error: 'Blog title is required' }, { status: 400 });
    }

    const result = await db.collection('blogs').insertOne(blog);

    return secureJson({ id: result.insertedId.toString(), ...blog });
  } catch (error) {
    console.error('Error creating blog:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to create blog' }, { status: 500 });
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
      return secureJson({ error: 'Invalid or missing blog ID' }, { status: 400 });
    }

    const db = await getDb();

    // Whitelist: only allow known updatable fields (prevents mass assignment)
    const safeUpdate: Record<string, unknown> = {};
    for (const field of BLOG_UPDATABLE_FIELDS) {
      if (!(field in updateData)) continue;
      if (field === 'published') {
        safeUpdate[field] = Boolean(updateData[field]);
      } else if (field === 'tags') {
        safeUpdate[field] = Array.isArray(updateData[field])
          ? (updateData[field] as unknown[]).map((t) => sanitizeString(t, 50))
          : [];
      } else if (field === 'content') {
        safeUpdate[field] = sanitizeString(updateData[field], 50000);
      } else {
        safeUpdate[field] = sanitizeString(updateData[field], 2048);
      }
    }

    if (Object.keys(safeUpdate).length === 0) {
      return secureJson({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await db.collection('blogs').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...safeUpdate, updatedAt: new Date(), updatedBy: adminCheck.userId } }
    );

    if (result.matchedCount === 0) {
      return secureJson({ error: 'Blog not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error updating blog:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to update blog' }, { status: 500 });
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
      return secureJson({ error: 'Invalid or missing blog ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('blogs').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return secureJson({ error: 'Blog not found' }, { status: 404 });
    }

    return secureJson({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
