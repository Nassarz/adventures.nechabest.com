import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import { sendEmail, escapeHtml } from '@/lib/email';
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
    const host = request.headers.get('host') || 'nechabest.com';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

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

    // Notify all active newsletter subscribers (asynchronous / non-blocking)
    db.collection('subscribers').find({ status: 'active' }).toArray().then((subscribers) => {
      if (!subscribers || subscribers.length === 0) return;

      const blogUrl = `${baseUrl}/blog/${result.insertedId.toString()}`;
      // Escape blog content to prevent XSS in email body
      const safeBlogTitle = escapeHtml(blog.title);
      const safeBlogExcerpt = escapeHtml(
        blog.excerpt || 'Read our latest update on environmental sustainability and capacity building...'
      );

      subscribers.forEach((sub) => {
        if (!sub.email) return;

        const subName = escapeHtml(sub.name || 'Friend');
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1a3c34; margin: 0;">Nechabest Sustainable Initiatives</h2>
              <p style="color: #58b05c; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Together for a Greener Future</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p>Hello <strong>${subName}</strong>,</p>
            <p>We have just published a new article on our blog: <strong>&ldquo;${safeBlogTitle}&rdquo;</strong>.</p>
            <p style="font-style: italic; color: #4a5568; margin: 16px 0; padding-left: 12px; border-left: 3px solid #58b05c;">
              &ldquo;${safeBlogExcerpt}&rdquo;
            </p>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${blogUrl}" style="background-color: #58b05c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Read the Full Post</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 11px; color: #718096; text-align: center; margin: 0;">
              You received this because you subscribed to Nechabest updates.<br />
              If you wish to unsubscribe, please <a href="${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color: #58b05c; text-decoration: underline;">click here to unsubscribe</a>.
            </p>
          </div>
        `;

        sendEmail({
          type: 'info',
          to: sub.email,
          subject: `New Blog Post: ${blog.title} - Nechabest`,
          html: emailHtml,
        }).catch((err) => {
          console.error(`[Email Notification] Failed sending newsletter email to ${sub.email}:`, err);
        });
      });
    }).catch((err) => {
      console.error('[Email Notification] Failed retrieving subscribers list:', err);
    });

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
