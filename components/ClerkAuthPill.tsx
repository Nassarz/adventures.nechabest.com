'use client';

import React, { useEffect, useState } from 'react';
import { ClerkLoaded, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function ClerkAuthPill() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <ClerkLoaded>
      <header className="fixed top-4 right-4 z-[120] flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 backdrop-blur-md border border-white/10">
        <Show when="signed-out">
          <SignInButton>
            <button className="rounded-full bg-white text-black text-xs font-bold px-3 py-1.5">Sign In</button>
          </SignInButton>
          <SignUpButton>
            <button className="rounded-full bg-nature text-black text-xs font-bold px-3 py-1.5">Sign Up</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </ClerkLoaded>
  );
}
