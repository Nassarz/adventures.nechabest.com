'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  ShoppingCart,
  Users,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

type DashboardStats = {
  totalBlogs: number;
  totalTours: number;
  totalBookings: number;
  subscribers: number;
  pendingComments: number;
};

type RecentBooking = {
  id: string;
  fullName?: string;
  customerName?: string;
  email?: string;
  tourTitle?: string;
  tourName?: string;
  numberOfPeople?: number;
  participants?: number;
  status?: string;
  createdAt?: string;
};

type RecentComment = {
  id: string;
  blogTitle: string;
  name: string;
  email: string;
  avatar?: string;
  comment: string;
  status: 'pending' | 'approved' | 'disapproved';
  createdAt?: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    totalTours: 0,
    totalBookings: 0,
    subscribers: 0,
    pendingComments: 0,
  });
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAccessOpen, setQuickAccessOpen] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, bookingsRes, commentsRes] = await Promise.all([
          fetch('/api/admin/stats', { cache: 'no-store' }),
          fetch('/api/admin/bookings', { cache: 'no-store' }),
          fetch('/api/admin/comments?status=all', { cache: 'no-store' }),
        ]);

        if (statsRes.ok) {
          const statsData = (await statsRes.json()) as DashboardStats;
          setStats({
            totalBlogs: Number(statsData.totalBlogs || 0),
            totalTours: Number(statsData.totalTours || 0),
            totalBookings: Number(statsData.totalBookings || 0),
            subscribers: Number(statsData.subscribers || 0),
            pendingComments: Number(statsData.pendingComments || 0),
          });
        }

        if (bookingsRes.ok) {
          const bookingData = (await bookingsRes.json()) as RecentBooking[];
          setBookings(bookingData.slice(0, 12));
        }

        if (commentsRes.ok) {
          const commentData = (await commentsRes.json()) as RecentComment[];
          setComments(commentData.slice(0, 12));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return bookings;
    }
    return bookings.filter((booking) => {
      const customer = booking.fullName || booking.customerName || '';
      const tour = booking.tourTitle || booking.tourName || '';
      const email = booking.email || '';
      return (
        customer.toLowerCase().includes(query) ||
        tour.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });
  }, [bookings, searchTerm]);

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      sub: 'All booking requests',
      icon: <ShoppingCart className="w-4 h-4" />,
      tone: 'bg-nature/20 text-nature',
    },
    {
      label: 'Subscribers',
      value: stats.subscribers,
      sub: 'Active newsletter users',
      icon: <Users className="w-4 h-4" />,
      tone: 'bg-black/10 text-black/70',
    },
    {
      label: 'Pending Comments',
      value: stats.pendingComments,
      sub: 'Waiting moderation',
      icon: <MessageSquare className="w-4 h-4" />,
      tone: 'bg-yellow-500/20 text-yellow-700',
    },
    {
      label: 'Published Blogs',
      value: stats.totalBlogs,
      sub: 'Live blog posts',
      icon: <BookOpen className="w-4 h-4" />,
      tone: 'bg-blue-500/20 text-blue-700',
    },
  ];

  return (
    <AdminLayout>
      <AdminHeader
        title="Dashboard"
        subtitle="Monitor your site, moderation queue, and recent activity"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-5 md:p-6">
          <div className="flex gap-5 items-start">
            <aside
              className={`shrink-0 transition-all duration-300 ${
                quickAccessOpen ? 'w-[300px] opacity-100' : 'w-[56px] opacity-100'
              }`}
            >
              <div className="rounded-2xl border border-black/5 bg-[#fcfcfd] p-3 md:p-4 shadow-[0_8px_25px_rgba(0,0,0,0.04)] sticky top-4">
                <button
                  type="button"
                  onClick={() => setQuickAccessOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-black hover:bg-black/5"
                >
                  {quickAccessOpen ? 'Quick Access' : 'Open'}
                  {quickAccessOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {quickAccessOpen && (
                  <div className="mt-4 space-y-3">
                    {[
                      { label: 'Manage Blogs', href: '/admin/blogs', stat: `${stats.totalBlogs} posts` },
                      { label: 'Moderate Comments', href: '/admin/comments', stat: `${stats.pendingComments} pending` },
                      { label: 'Manage Tours', href: '/admin/tours', stat: `${stats.totalTours} tours` },
                      { label: 'Manage Newsletter', href: '/admin/newsletter', stat: `${stats.subscribers} subscribers` },
                    ].map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="block rounded-xl border border-black/10 bg-white px-4 py-3 hover:border-nature/30 hover:bg-nature/5 transition-all"
                      >
                        <p className="text-sm font-semibold text-black">{link.label}</p>
                        <p className="text-xs text-black/55 mt-1">{link.stat}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <div className="flex-1 space-y-5 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className="rounded-2xl border border-black/5 p-5 bg-[#fcfcfd] shadow-[0_8px_25px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-black/50 font-medium">{card.label}</p>
                      <div className={`p-2 rounded-lg ${card.tone}`}>{card.icon}</div>
                    </div>
                    <p className="text-4xl font-semibold text-black tracking-tight">{card.value}</p>
                    <p className="text-xs text-black/45 mt-2">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              <section className="rounded-2xl border border-black/5 bg-[#fcfcfd] shadow-[0_8px_25px_rgba(0,0,0,0.04)] p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-black">Recent Bookings</h2>
                  <div className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 bg-white max-w-sm w-full">
                    <Search size={14} className="text-black/45" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent outline-none text-xs placeholder:text-black/35 w-full"
                      placeholder="Search bookings"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-black/60">Loading dashboard data...</div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-8 text-center text-black/60">No bookings found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead>
                        <tr className="text-black/45 text-xs uppercase tracking-wide border-b border-black/5">
                          <th className="text-left py-3 font-medium">Date</th>
                          <th className="text-left py-3 font-medium">Customer</th>
                          <th className="text-left py-3 font-medium">Email</th>
                          <th className="text-left py-3 font-medium">Tour</th>
                          <th className="text-left py-3 font-medium">People</th>
                          <th className="text-left py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => {
                          const customer = booking.fullName || booking.customerName || 'Unknown';
                          const tour = booking.tourTitle || booking.tourName || 'Untitled Tour';
                          const people = booking.numberOfPeople || booking.participants || 1;
                          const status = (booking.status || 'pending').toLowerCase();
                          return (
                            <tr key={booking.id} className="border-b border-black/5 last:border-0">
                              <td className="py-3 text-black/70">
                                {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Recent'}
                              </td>
                              <td className="py-3 text-black font-medium">{customer}</td>
                              <td className="py-3 text-black/70">{booking.email || '-'}</td>
                              <td className="py-3 text-black/75">{tour}</td>
                              <td className="py-3 text-black/75">{people}</td>
                              <td className="py-3">
                                <span
                                  className={`text-[11px] px-2 py-1 rounded-full ${
                                    status === 'confirmed' || status === 'completed'
                                      ? 'bg-nature/15 text-nature'
                                      : status === 'cancelled'
                                        ? 'bg-red-500/10 text-red-600'
                                        : 'bg-yellow-500/10 text-yellow-700'
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-black/5 bg-[#fcfcfd] shadow-[0_8px_25px_rgba(0,0,0,0.04)] p-5">
                <h2 className="text-xl font-semibold text-black mb-4">Recent Comment Activity</h2>
                {loading ? (
                  <div className="p-8 text-center text-black/60">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="p-8 text-center text-black/60">No comments found.</div>
                ) : (
                  <div className="space-y-3">
                    {comments.slice(0, 6).map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-black/10 bg-white px-4 py-3 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-black truncate">{comment.blogTitle}</p>
                          <p className="text-xs text-black/60 mt-1 truncate">
                            {comment.name} ({comment.email})
                          </p>
                          <p className="text-sm text-black/70 mt-2 line-clamp-2">{comment.comment}</p>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full shrink-0 ${
                            comment.status === 'approved'
                              ? 'bg-green-500/15 text-green-700'
                              : comment.status === 'disapproved'
                                ? 'bg-red-500/15 text-red-700'
                                : 'bg-yellow-500/15 text-yellow-700'
                          }`}
                        >
                          {comment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
