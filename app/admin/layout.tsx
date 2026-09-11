'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map, Calendar, FileText, MessageSquare, Image, Settings, BarChart3, Mail, Megaphone, Menu, X, LogOut } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Map, label: 'Tours', href: '/admin/tours' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: FileText, label: 'Blog', href: '/admin/blogs' },
  { icon: MessageSquare, label: 'Comments', href: '/admin/comments' },
  { icon: Megaphone, label: 'Banners', href: '/admin/banners' },
  { icon: Mail, label: 'Newsletter', href: '/admin/newsletter' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Image, label: 'Media', href: '/admin/media' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#1A3C34] text-white p-6 hidden lg:flex flex-col fixed h-full z-30">
        <Link href="/admin" className="font-display text-xl font-bold mb-10">Admin Panel</Link>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                  isActive ? 'text-white bg-white/15' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-sm font-bold mt-auto">
          <LogOut className="w-5 h-5" />
          Back to Site
        </Link>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1A3C34] text-white px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-display text-lg font-bold">Admin Panel</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/10">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 z-30 bg-[#1A3C34] pt-16"
          >
            <nav className="p-6 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                      isActive ? 'text-white bg-white/15' : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-sm font-bold mt-8">
                <LogOut className="w-5 h-5" />
                Back to Site
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 lg:ml-64 pt-20 lg:pt-12">
        {children}
      </main>
    </div>
  );
}
