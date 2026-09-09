'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Map, Calendar, FileText, Image, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A3C34] text-white p-6 hidden lg:flex flex-col">
        <Link href="/admin" className="font-display text-xl font-bold mb-10">Admin Panel</Link>
        <nav className="space-y-2 flex-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
            { icon: Map, label: 'Tours', href: '/admin/tours' },
            { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
            { icon: FileText, label: 'Blog', href: '/admin/blogs' },
            { icon: Image, label: 'Media', href: '/admin/media' },
            { icon: Settings, label: 'Settings', href: '/admin/settings' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold">
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-sm font-bold">
          <LogOut className="w-5 h-5" />
          Back to Site
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12">
        {children}
      </main>
    </div>
  );
}
