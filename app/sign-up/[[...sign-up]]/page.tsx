'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <SignUp
        appearance={{
          elements: {
            card: 'bg-white/95 shadow-2xl',
          },
        }}
      />
    </main>
  );
}
