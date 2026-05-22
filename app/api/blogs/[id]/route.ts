import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  isValidObjectId,
  secureJson,
  withSecurityHeaders,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

// Get single blog post with view tracking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit: 120 requests per minute per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`blog-single:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const db = await getDb();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return secureJson({ error: 'Invalid blog ID' }, { status: 400 });
    }

    // Check if user has viewed this blog recently using cookie
    const viewedBlogsCookie = request.cookies.get(`blog_viewed_${id}`);

    // Build a privacy-safe fingerprint — hash IP + UA, never store raw IP
    const userAgent = sanitizeString(request.headers.get('user-agent'), 500);
    const visitorFingerprint = Buffer.from(`${ip}-${userAgent}`).toString('base64');

    // Only increment view if no recent cookie found
    if (!viewedBlogsCookie) {
      // Check if this visitor fingerprint viewed in last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentView = await db.collection('blog_views').findOne({
        blogId: id,
        visitorFingerprint,
        timestamp: { $gte: oneDayAgo },
      });

      if (!recentView) {
        // Increment view count
        await db.collection('blogs').updateOne(
          { _id: new ObjectId(id) },
          {
            $inc: { views: 1 },
            $set: { lastViewed: new Date() },
          }
        );

        // Record the view — store fingerprint only, NOT raw IP
        await db.collection('blog_views').insertOne({
          blogId: id,
          visitorFingerprint,
          timestamp: new Date(),
        });
      }
    }

    const blog = await db.collection('blogs').findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return secureJson({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get approved comments for this blog
    const comments = await db
      .collection('blog_comments')
      .find({ blogId: id, approved: true })
      .sort({ createdAt: -1 })
      .toArray();

    const related = await db
      .collection('blogs')
      .find({
        _id: { $ne: new ObjectId(id) },
        published: { $ne: false },
      })
      .sort({ views: -1, createdAt: -1 })
      .limit(3)
      .toArray();

    const responseBody = {
      ...blog,
      id: blog._id.toString(),
      image: blog.image || 'https://picsum.photos/seed/blog/1200/800',
      avatar: blog.avatar || `https://picsum.photos/seed/${sanitizeString(blog.author, 50) || 'author'}/100/100`,
      _id: undefined,
      comments: comments.map((comment) => ({
        id: comment._id.toString(),
        author: sanitizeString(comment.name, 100),
        content: sanitizeString(comment.comment, 2000),
        avatar: '/icons/comment-default.svg',
        createdAt: comment.createdAt,
        // Never expose commenter email in public response
      })),
      relatedPosts: related.map((item) => ({
        ...item,
        id: item._id.toString(),
        image: item.image || 'https://picsum.photos/seed/blog/800/600',
        _id: undefined,
      })),
    };

    // Build response with security headers, then set the view-dedup cookie
    const response = secureJson(responseBody);
    response.cookies.set(`blog_viewed_${id}`, '1', {
      maxAge: 24 * 60 * 60, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Error fetching blog:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}
