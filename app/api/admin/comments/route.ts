import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';

type CommentStatus = 'pending' | 'approved' | 'disapproved';

function getNormalizedStatus(comment: Record<string, unknown>): CommentStatus {
  const status = typeof comment.status === 'string' ? comment.status : undefined;
  const approved = comment.approved === true;

  if (status === 'approved' || approved) {
    return 'approved';
  }
  if (status === 'disapproved') {
    return 'disapproved';
  }
  return 'pending';
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const db = await getDb();
    const comments = await db.collection('blog_comments').find({}).sort({ createdAt: -1 }).toArray();

    const blogIdStrings = Array.from(
      new Set(
        comments
          .map((comment) => comment.blogId)
          .filter((blogId): blogId is string => typeof blogId === 'string' && ObjectId.isValid(blogId))
      )
    );

    const blogs = blogIdStrings.length
      ? await db
          .collection('blogs')
          .find({ _id: { $in: blogIdStrings.map((id) => new ObjectId(id)) } })
          .project({ title: 1 })
          .toArray()
      : [];

    const blogTitleMap = new Map(blogs.map((blog) => [blog._id.toString(), blog.title || 'Untitled Blog']));

    const normalizedComments = comments
      .map((comment) => {
        const normalizedStatus = getNormalizedStatus(comment);
        return {
          id: comment._id.toString(),
          blogId: comment.blogId,
          blogTitle: blogTitleMap.get(comment.blogId) || 'Unknown Blog',
          name: comment.name || 'Anonymous',
          email: comment.email || '',
          comment: comment.comment || '',
          avatar: '/icons/comment-default.svg',
          createdAt: comment.createdAt,
          status: normalizedStatus,
          approved: normalizedStatus === 'approved',
        };
      })
      .filter((comment) => (status === 'all' ? true : comment.status === status));

    return NextResponse.json(normalizedComments);
  } catch (error) {
    console.error('Error fetching blog comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { id, action } = body as { id?: string; action?: CommentStatus };

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 });
    }

    if (!action || !['pending', 'approved', 'disapproved'].includes(action)) {
      return NextResponse.json({ error: 'Invalid moderation action' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('blog_comments').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: action,
          approved: action === 'approved',
          reviewedAt: new Date(),
          reviewedBy: adminCheck.userId,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moderating blog comment:', error);
    return NextResponse.json({ error: 'Failed to update comment status' }, { status: 500 });
  }
}