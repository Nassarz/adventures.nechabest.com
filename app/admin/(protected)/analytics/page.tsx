'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, LineChart, TrendingUp, Eye } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

interface AnalyticsData {
  stats: {
    totalViews: number;
    totalBlogViews: number;
    activeUsers: number;
    conversionRate: number;
    engagementScore: number;
    viewsChange: number;
    activeUsersChange: number;
    conversionChange: number;
  };
  topPages: Array<{ page: string; views: number; visitors: number }>;
  topBlogs: Array<{ title: string; views: number; date: Date }>;
  monthlyData: Array<{ month: string; blogs: number; tours: number; bookings: number; visitors: number }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminHeader title="Analytics" subtitle="Loading analytics data..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <AdminHeader title="Analytics" subtitle="Failed to load analytics" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-black/60">Failed to load analytics data</p>
        </div>
      </AdminLayout>
    );
  }

  const analyticsCards = [
    {
      title: 'Total Page Views',
      value: analytics.stats.totalViews.toLocaleString(),
      change: `${analytics.stats.viewsChange > 0 ? '+' : ''}${analytics.stats.viewsChange}% from last month`,
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      changePositive: analytics.stats.viewsChange >= 0,
    },
    {
      title: 'Blog Views',
      value: analytics.stats.totalBlogViews.toLocaleString(),
      change: 'Total unique blog views',
      icon: Eye,
      color: 'from-indigo-500 to-indigo-600',
      changePositive: true,
    },
    {
      title: 'Active Users',
      value: analytics.stats.activeUsers.toLocaleString(),
      change: `${analytics.stats.activeUsersChange > 0 ? '+' : ''}${analytics.stats.activeUsersChange}% from last week`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      changePositive: analytics.stats.activeUsersChange >= 0,
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.stats.conversionRate}%`,
      change: `${analytics.stats.conversionChange > 0 ? '+' : ''}${analytics.stats.conversionChange}% from last week`,
      icon: BarChart,
      color: 'from-orange-500 to-orange-600',
      changePositive: analytics.stats.conversionChange >= 0,
    },
  ];

  return (
    <AdminLayout>
      <AdminHeader 
        title="Analytics" 
        subtitle="Real-time insights and performance metrics from your site"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-black/10 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-black/60 text-sm font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-black mt-2">{card.value}</p>
                    <p className={`text-xs mt-2 font-medium ${card.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                      {card.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-black/10 p-6"
            >
              <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-nature" />
                Monthly Activity
              </h3>
              <div className="space-y-4">
                {analytics.monthlyData.map((data, idx) => {
                  const maxValue = Math.max(...analytics.monthlyData.map(d => d.visitors + d.bookings));
                  const percentage = maxValue > 0 ? ((data.visitors + data.bookings) / maxValue) * 100 : 0;
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-black font-bold">{data.month}</span>
                        <span className="text-black/60 text-sm">
                          {data.visitors} visitors · {data.bookings} bookings
                        </span>
                      </div>
                      <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: idx * 0.1 + 0.5, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-nature to-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Pages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-black/10 p-6"
            >
              <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-nature" />
                Most Visited Pages
              </h3>
              <div className="space-y-4">
                {analytics.topPages.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-black/2 rounded-lg hover:bg-black/5 transition-colors">
                    <div>
                      <p className="text-black font-medium">{item.page}</p>
                      <p className="text-black/50 text-sm">{item.visitors} unique visitors</p>
                    </div>
                    <div className="text-right">
                      <p className="text-black font-bold">{item.views}</p>
                      <p className="text-black/50 text-xs">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Top Blogs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-black/10 p-6"
          >
            <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-nature" />
              Top Performing Blogs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.topBlogs.slice(0, 6).map((blog, idx) => (
                <div key={idx} className="p-4 bg-black/2 rounded-lg hover:bg-black/5 transition-colors">
                  <h4 className="text-black font-medium text-sm line-clamp-2 mb-2">{blog.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-nature font-bold">{blog.views} views</span>
                    <span className="text-black/50 text-xs">
                      {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Engagement Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-nature to-primary rounded-xl p-6 text-white"
          >
            <h3 className="text-lg font-bold mb-4">Engagement Score</h3>
            <div className="flex items-end gap-4">
              <div className="text-5xl font-bold">{analytics.stats.engagementScore}%</div>
              <div className="pb-2">
                <p className="text-white/80 text-sm">Average pages per visit</p>
                <p className="text-white/60 text-xs">Based on last 7 days of activity</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
