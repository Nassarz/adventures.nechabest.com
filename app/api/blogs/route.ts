import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  checkRateLimit,
  getClientIdentifier,
  sanitizeString,
  secureJson,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Rate limit: 120 requests per minute per IP
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`blogs:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const db = await getDb();
    const blogs = await db
      .collection('blogs')
      .find({ published: { $ne: false } })
      .sort({ views: -1, createdAt: -1 })
      .toArray();

    return secureJson(
      blogs.map((blog) => ({
        ...blog,
        id: blog._id.toString(),
        image: blog.image || 'https://picsum.photos/seed/blog/800/600',
        avatar: blog.avatar || `https://picsum.photos/seed/${sanitizeString(blog.author, 50) || 'author'}/100/100`,
        _id: undefined,
      }))
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
