import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// Get single blog post with view tracking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    // Check if user has viewed this blog recently using cookie
    const cookies = request.cookies;
    const viewedBlogsCookie = cookies.get(`blog_viewed_${id}`);
    
    // Get user fingerprint from headers
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
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
            $set: { lastViewed: new Date() }
          }
        );

        // Record the view
        await db.collection('blog_views').insertOne({
          blogId: id,
          visitorFingerprint,
          userAgent,
          ip,
          timestamp: new Date(),
        });
      }
    }

    const blog = await db.collection('blogs').findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get comments for this blog
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

    const response = NextResponse.json({
      ...blog,
      id: blog._id.toString(),
      image: blog.image || 'https://picsum.photos/seed/blog/1200/800',
      avatar: blog.avatar || `https://picsum.photos/seed/${blog.author || 'author'}/100/100`,
      _id: undefined,
      comments: comments.map((comment) => ({
        ...comment,
        id: comment._id.toString(),
        author: comment.name,
        content: comment.comment,
        avatar: '/icons/comment-default.svg',
        _id: undefined,
      })),
      relatedPosts: related.map((item) => ({
        ...item,
        id: item._id.toString(),
        image: item.image || 'https://picsum.photos/seed/blog/800/600',
        _id: undefined,
      })),
    });

    // Set cookie to prevent duplicate views (expires in 24 hours)
    response.cookies.set(`blog_viewed_${id}`, '1', {
      maxAge: 24 * 60 * 60, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}
