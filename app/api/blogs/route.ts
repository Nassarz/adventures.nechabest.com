import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const blogs = await db
      .collection('blogs')
      .find({ published: { $ne: false } })
      .sort({ views: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      blogs.map((blog) => ({
        ...blog,
        id: blog._id.toString(),
        image: blog.image || 'https://picsum.photos/seed/blog/800/600',
        avatar: blog.avatar || `https://picsum.photos/seed/${blog.author || 'author'}/100/100`,
        _id: undefined,
      }))
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    // Avoid breaking the homepage if database reads fail.
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
