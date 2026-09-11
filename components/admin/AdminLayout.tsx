'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminShell({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-3 md:p-4">
      <div className="flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] gap-3 md:gap-4">
        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isExpanded={sidebarExpanded}
          onToggleExpanded={() => setSidebarExpanded((prev) => !prev)}
        />

        <div
          className={`flex-1 flex flex-col overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all duration-300 ${
            sidebarExpanded ? 'lg:ml-[280px]' : 'lg:ml-[104px]'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
