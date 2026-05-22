import { getDb } from '@/lib/mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import { secureJson } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Total Page Views (unique visitors in last 30 days)
    const totalPageViewsPipeline = await db.collection('page_views').aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$visitorFingerprint' } },
      { $count: 'uniqueVisitors' }
    ]).toArray();
    const totalViews = totalPageViewsPipeline[0]?.uniqueVisitors || 0;

    // Previous period for comparison
    const previousPageViewsPipeline = await db.collection('page_views').aggregate([
      { $match: { timestamp: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: '$visitorFingerprint' } },
      { $count: 'uniqueVisitors' }
    ]).toArray();
    const previousViews = previousPageViewsPipeline[0]?.uniqueVisitors || 1;
    const viewsChange = previousViews > 0 ? ((totalViews - previousViews) / previousViews * 100).toFixed(1) : '0';

    // Total Blog Views
    const blogs = await db.collection('blogs').find({}).toArray();
    const totalBlogViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

    // Active Users (unique visitors in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersPipeline = await db.collection('page_views').aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$visitorFingerprint' } },
      { $count: 'uniqueVisitors' }
    ]).toArray();
    const activeUsers = activeUsersPipeline[0]?.uniqueVisitors || 0;

    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousActiveUsersPipeline = await db.collection('page_views').aggregate([
      { $match: { timestamp: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
      { $group: { _id: '$visitorFingerprint' } },
      { $count: 'uniqueVisitors' }
    ]).toArray();
    const previousActiveUsers = previousActiveUsersPipeline[0]?.uniqueVisitors || 1;
    const activeUsersChange = previousActiveUsers > 0 ? ((activeUsers - previousActiveUsers) / previousActiveUsers * 100).toFixed(1) : '0';

    // Conversion Rate (bookings / active users * 100)
    const totalBookings = await db.collection('bookings').countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    const conversionRate = activeUsers > 0 ? ((totalBookings / activeUsers) * 100).toFixed(1) : '0';

    const previousBookings = await db.collection('bookings').countDocuments({
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });
    const previousConversionRate = previousActiveUsers > 0 ? (previousBookings / previousActiveUsers) * 100 : 1;
    const conversionChange = previousConversionRate > 0 ? ((parseFloat(conversionRate) - previousConversionRate) / previousConversionRate * 100).toFixed(1) : '0';

    // Engagement Score (pages per visitor)
    const totalPageViews = await db.collection('page_views').countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });
    const engagementScore = activeUsers > 0 ? ((totalPageViews / activeUsers) * 100 / 5).toFixed(0) : '0'; // normalized to percentage
    
    // Most Visited Pages
    const topPagesPipeline = await db.collection('page_views').aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { 
          _id: '$page', 
          views: { $sum: 1 },
          visitors: { $addToSet: '$visitorFingerprint' }
        } 
      },
      { 
        $project: {
          page: '$_id',
          views: 1,
          visitors: { $size: '$visitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]).toArray();

    const topPages = topPagesPipeline.map(item => ({
      page: formatPageName(item.page || item._id),
      views: item.views,
      visitors: item.visitors
    }));

    // Top Blogs by Views
    const topBlogs = await db.collection('blogs')
      .find({ published: { $ne: false } })
      .sort({ views: -1 })
      .limit(10)
      .project({ title: 1, views: 1, createdAt: 1 })
      .toArray();

    const topBlogsFormatted = topBlogs.map(blog => ({
      title: blog.title,
      views: blog.views || 0,
      date: blog.createdAt
    }));

    // Monthly activity data for last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const [blogsCount, toursCount, bookingsCount, pageViewsCount] = await Promise.all([
        db.collection('blogs').countDocuments({
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }),
        db.collection('tours').countDocuments({
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }),
        db.collection('bookings').countDocuments({
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }),
        db.collection('page_views').aggregate([
          { $match: { timestamp: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: '$visitorFingerprint' } },
          { $count: 'count' }
        ]).toArray()
      ]);

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
      monthlyData.push({
        month: monthName,
        blogs: blogsCount,
        tours: toursCount,
        bookings: bookingsCount,
        visitors: pageViewsCount[0]?.count || 0
      });
    }

    return secureJson({
      stats: {
        totalViews,
        totalBlogViews,
        activeUsers,
        conversionRate: parseFloat(conversionRate),
        engagementScore: parseInt(engagementScore),
        viewsChange: parseFloat(viewsChange),
        activeUsersChange: parseFloat(activeUsersChange),
        conversionChange: parseFloat(conversionChange),
      },
      topPages,
      topBlogs: topBlogsFormatted,
      monthlyData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return secureJson({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function formatPageName(path: string): string {
  if (!path || path === '/') return 'Home';
  
  const cleaned = path.replace(/^\/+|\/+$/g, '');
  const parts = cleaned.split('/');
  
  // Handle common routes
  if (parts[0] === 'blog' && parts.length === 1) return 'Blog';
  if (parts[0] === 'blog' && parts.length > 1) return 'Blog Post';
  if (parts[0] === 'tours') return 'Eco-Tourism';
  if (parts[0] === 'about') return 'About Us';
  if (parts[0] === 'contact') return 'Contact';
  if (parts[0] === 'booking') return 'Booking';
  
  // Capitalize first letter of first segment
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}
