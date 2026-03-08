'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [pendingComments, setPendingComments] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const checkPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    let mounted = true;
    let previousPending = 0;

    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' });
        if (!res.ok) {
          return;
        }
        const stats = (await res.json()) as { pendingComments?: number };
        const nextPending = Number(stats.pendingComments || 0);

        if (mounted) {
          setPendingComments(nextPending);
        }

        if (
          previousPending > 0 &&
          nextPending > previousPending &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          const added = nextPending - previousPending;
          new Notification('New Comment Notification', {
            body: `${added} new comment${added > 1 ? 's' : ''} waiting for approval.`,
            icon: '/icons/comment-default.svg',
          });
        }

        previousPending = nextPending;
      } catch (error) {
        console.error('Failed to load admin notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const enableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const handleSearchNavigate = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return;
    }

    const destinations: Array<{ match: RegExp; path: string }> = [
      { match: /dashboard|home/, path: '/admin' },
      { match: /blog/, path: '/admin/blogs' },
      { match: /comment|moderation/, path: '/admin/comments' },
      { match: /tour/, path: '/admin/tours' },
      { match: /booking|order/, path: '/admin/bookings' },
      { match: /newsletter|subscriber/, path: '/admin/newsletter' },
      { match: /media|image/, path: '/admin/media' },
      { match: /analytics|insight|report/, path: '/admin/analytics' },
      { match: /content|cms/, path: '/admin/site-content' },
      { match: /setting/, path: '/admin/settings' },
    ];

    const destination = destinations.find((entry) => entry.match.test(q));
    if (destination) {
      router.push(destination.path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur-md"
    >
      <div className="px-5 md:px-6 py-4 flex items-center gap-3 md:gap-5">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-[2rem] font-bold text-black leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-black/50 mt-1 text-sm truncate">{subtitle}</p>}
        </div>

        <div className="hidden xl:flex flex-1 justify-center">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#f2f3f5] px-4 py-2.5 rounded-full border border-black/5 w-full max-w-xl">
            <Search size={17} className="text-black/45" />
            <input
              type="text"
              placeholder="Go to: blogs, comments, tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchNavigate();
                }
              }}
              className="bg-transparent outline-none text-black placeholder-black/35 w-full text-sm"
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-black/10 text-black/45">K</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setNotificationOpen((prev) => !prev)}
              className="p-2 hover:bg-black/5 rounded-full transition-all relative border border-black/10 bg-white"
              title="Notifications"
            >
              <Bell size={18} className="text-black/70" />
              {pendingComments > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-nature text-black text-[10px] font-bold flex items-center justify-center">
                  {pendingComments > 99 ? '99+' : pendingComments}
                </span>
              )}
            </motion.button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-black/10 bg-white shadow-xl p-4 z-30">
                <p className="text-xs uppercase tracking-widest text-black/50">Notifications</p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/70">Pending comments</span>
                    <span className="font-bold text-black">{pendingComments}</span>
                  </div>
                  <a
                    href="/admin/comments"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-nature hover:underline"
                  >
                    <CheckCircle2 size={14} />
                    Open moderation queue
                  </a>
                  <button
                    type="button"
                    onClick={enableNotifications}
                    className="w-full rounded-lg bg-nature/15 text-nature text-sm font-semibold py-2 hover:bg-nature/25"
                  >
                    {notificationPermission === 'granted' ? 'Push notifications enabled' : 'Enable push notifications'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="hidden md:flex items-center gap-2 rounded-full bg-[#f2f3f5] border border-black/5 px-2 py-1.5"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-nature to-nature/70 flex items-center justify-center text-[11px] font-bold text-black">
              AD
            </div>
            <div className="pr-2">
              <p className="text-xs font-semibold text-black leading-tight">Admin</p>
              <p className="text-[10px] text-black/45 leading-tight">Dashboard</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
