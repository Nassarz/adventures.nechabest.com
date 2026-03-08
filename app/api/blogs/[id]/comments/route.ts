import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Post a comment on a blog
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const { id } = await params;
    const body = await request.json();

    const { name, email, comment } = body;

    if (!name || !email || !comment) {
      return NextResponse.json(
        { error: 'Name, email, and comment are required' },
        { status: 400 }
      );
    }

    const newComment = {
      blogId: id,
      name,
      email,
      comment,
      createdAt: new Date(),
      status: 'pending',
      approved: false, // Comments need admin approval
    };

    const result = await db.collection('blog_comments').insertOne(newComment);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newComment,
      message: 'Comment submitted successfully. It will appear after admin approval.',
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
