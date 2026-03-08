'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
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
