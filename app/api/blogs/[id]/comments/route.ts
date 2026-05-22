import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  sanitizeEmail,
  isBotRequest,
  isValidObjectId,
  secureJson,
  checkOrigin,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // CORS
  const originError = checkOrigin(request, true);
  if (originError) return originError;

  // Rate limit: 5 comments per 10 minutes per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`comment:${ip}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
    message: 'Too many comments submitted. Please wait a few minutes.',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return secureJson({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const body = await request.json();

    // Bot protection
    if (isBotRequest(body)) {
      return secureJson({ error: 'Invalid submission' }, { status: 400 });
    }

    const name = sanitizeString(body.name, 100);
    const email = sanitizeEmail(body.email);
    const comment = sanitizeString(body.comment, 2000);

    if (!name) return secureJson({ error: 'Name is required' }, { status: 400 });
    if (!email) return secureJson({ error: 'A valid email address is required' }, { status: 400 });
    if (!comment || comment.length < 3) {
      return secureJson({ error: 'Comment must be at least 3 characters' }, { status: 400 });
    }

    const db = await getDb();

    // Verify the blog exists
    const { ObjectId } = await import('mongodb');
    const blog = await db.collection('blogs').findOne({ _id: new ObjectId(id) });
    if (!blog) {
      return secureJson({ error: 'Blog post not found' }, { status: 404 });
    }

    const newComment = {
      blogId: id,
      name,
      email,
      comment,
      createdAt: new Date(),
      status: 'pending',
      approved: false,
    };

    const result = await db.collection('blog_comments').insertOne(newComment);

    return secureJson({
      id: result.insertedId.toString(),
      ...newComment,
      message: 'Comment submitted successfully. It will appear after admin approval.',
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return secureJson({ error: 'Failed to post comment' }, { status: 500 });
  }
}
