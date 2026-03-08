import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();

    const [totalBlogs, totalTours, totalBookings, subscribers, pendingComments] = await Promise.all([
      db.collection('blogs').countDocuments({}),
      db.collection('tours').countDocuments({}),
      db.collection('bookings').countDocuments({}),
      db.collection('subscribers').countDocuments({ status: { $in: ['Active', 'active'] } }),
      db.collection('blog_comments').countDocuments({
        $or: [
          { status: 'pending' },
          { status: { $exists: false }, approved: { $ne: true } },
        ],
      }),
    ]);

    return NextResponse.json({
      totalBlogs,
      totalTours,
      totalBookings,
      subscribers,
      pendingComments,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
