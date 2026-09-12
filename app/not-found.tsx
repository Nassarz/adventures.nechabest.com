'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="font-display text-8xl font-bold text-nature/20">404</h1>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
            Adventure Not Found
          </h2>
          <p className="text-foreground/60 text-lg max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to planning your next adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="px-8 py-3 rounded-full bg-nature text-white font-bold text-sm hover:bg-primary transition-all shadow-lg"
            >
              Back to Home
            </Link>
            <Link
              href="/adventures"
              className="px-8 py-3 rounded-full border-2 border-nature text-nature font-bold text-sm hover:bg-nature hover:text-white transition-all"
            >
              Browse Adventures
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
