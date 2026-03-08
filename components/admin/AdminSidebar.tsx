'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  MessageSquare,
  MapPin, 
  Calendar, 
  Mail, 
  Images, 
  FileText,
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export default function AdminSidebar({
  isOpen,
  setIsOpen,
  isExpanded,
  onToggleExpanded,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/sign-in?redirect_url=/admin');
  };

  const menuSections = [
    {
      title: 'Content',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Blogs', href: '/admin/blogs', icon: BookOpen },
        { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
        { name: 'Tours', href: '/admin/tours', icon: MapPin },
        { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
        { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
        { name: 'Site Content', href: '/admin/site-content', icon: FileText },
        { name: 'Media', href: '/admin/media', icon: Images },
      ],
    },
    {
      title: 'Insights',
      items: [
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'General',
      items: [
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-nature text-black p-3 rounded-full shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-3 top-3 md:left-4 md:top-4 h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)] rounded-[1.5rem] border border-black/5 bg-[#fcfcfd] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-y-auto lg:translate-x-0 z-50 transition-all duration-300 ${
          isExpanded ? 'w-[268px]' : 'w-[92px]'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between gap-2">
            <Link href="/admin" className="flex items-center gap-2 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-nature to-nature/70 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <span className="font-bold text-black text-lg">N</span>
              </div>
              {isExpanded && (
                <div className="min-w-0">
                  <p className="font-bold text-black leading-tight truncate">Nechabest</p>
                  <p className="text-[11px] text-black/45">Admin Console</p>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={onToggleExpanded}
              className="hidden lg:inline-flex p-2 rounded-lg border border-black/10 bg-white text-black/60 hover:bg-black/5"
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-5 pb-28">
            {menuSections.map((section) => (
              <div key={section.title}>
                {isExpanded && (
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35 px-2 mb-2">
                    {section.title}
                  </p>
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={`${section.title}-${item.name}`}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          active
                            ? 'bg-nature text-black font-semibold shadow-[0_8px_20px_rgba(0,255,0,0.2)]'
                            : 'text-black/70 hover:text-black hover:bg-black/5'
                        }`}
                        title={isExpanded ? undefined : item.name}
                      >
                        <span className={`flex items-center gap-3 ${isExpanded ? '' : 'justify-center w-full'}`}>
                          <Icon size={17} />
                          {isExpanded && item.name}
                        </span>
                        {isExpanded && item.name === 'Site Content' && (
                          <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-full leading-none">CMS</span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/5 bg-[#fcfcfd]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-sm font-medium ${
              isExpanded ? 'gap-3 justify-start' : 'justify-center'
            }`}
            title={isExpanded ? undefined : 'Log Out'}
          >
            <LogOut size={17} />
            {isExpanded && <span>Log Out</span>}
          </motion.button>
        </div>
      </aside>
    </>
  );
}
