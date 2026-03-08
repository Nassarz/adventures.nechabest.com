'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKeys) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
        <div className="bg-white/95 shadow-2xl rounded-3xl p-12 max-w-md text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Clerk Not Configured</h1>
          <p className="text-black/60 mb-6">
            Clerk authentication is not set up. Please add valid Clerk API keys to your <code className="bg-black/10 px-2 py-1 rounded">.env.local</code> file.
          </p>
          <div className="text-left bg-black/5 rounded-lg p-4 mb-6 text-sm">
            <p className="font-bold mb-2">Steps to configure:</p>
            <ol className="list-decimal list-inside space-y-1 text-black/70">
              <li>Visit <a href="https://dashboard.clerk.com" target="_blank" className="text-blue-600 underline">dashboard.clerk.com</a></li>
              <li>Create or select your application</li>
              <li>Copy API keys from &quot;API Keys&quot; section</li>
              <li>Add keys to .env.local file</li>
            </ol>
          </div>
          <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-black/80 transition">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <SignIn
        appearance={{
          elements: {
            card: 'bg-white/95 shadow-2xl',
          },
        }}
      />
    </main>
  );
}
