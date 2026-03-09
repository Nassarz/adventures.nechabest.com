'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  const rawKey = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').replace(/\$/g, '').trim();
  const publishableKey = rawKey.match(/(pk_(?:test|live)_[A-Za-z0-9._-]+)/)?.[1] || '';

  if (!publishableKey) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
        <div className="bg-white/95 shadow-2xl rounded-3xl p-8 max-w-xl text-center">
          <h1 className="text-2xl font-bold text-black mb-3">Authentication Not Configured</h1>
          <p className="text-black/70 mb-5">
            Clerk publishable key is missing or invalid in this deployment. Set
            <code className="mx-1 rounded bg-black/10 px-2 py-0.5">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>
            in Vercel and redeploy.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-black px-5 py-2.5 font-semibold text-white hover:bg-black/80"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <SignIn
        forceRedirectUrl="/admin"
        fallbackRedirectUrl="/admin"
        appearance={{
          elements: {
            card: 'bg-white/95 shadow-2xl',
          },
        }}
      />
    </main>
  );
}
