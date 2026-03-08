'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';

const hasClerkKeys = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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
  if (!hasClerkKeys) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl">
          <h1 className="text-4xl font-bold text-black mb-4">Admin Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Clerk Not Configured</h2>
            <p className="text-red-700 mb-4">
              This admin dashboard requires Clerk authentication. Please configure Clerk to access admin features.
            </p>
          </div>
          <div className="bg-black/5 rounded-xl p-6 mb-6">
            <p className="font-bold text-black mb-3">To set up Clerk authentication:</p>
            <ol className="list-decimal list-inside space-y-2 text-black/70">
              <li>Visit <a href="https://dashboard.clerk.com" target="_blank" className="text-blue-600 underline">dashboard.clerk.com</a> and sign in</li>
              <li>Create a new application or select an existing one</li>
              <li>Go to &quot;API Keys&quot; section</li>
              <li>Copy your Publishable Key and Secret Key</li>
              <li>Add them to your <code className="bg-black/10 px-2 py-1 rounded">.env.local</code> file:</li>
            </ol>
            <pre className="mt-4 bg-black text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}
            </pre>
            <li className="mt-3 text-black/70">Restart your development server</li>
          </div>
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-black/80 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
