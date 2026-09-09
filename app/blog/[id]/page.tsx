'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-16 md:pt-40 md:pb-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-foreground/60 hover:text-nature transition-colors text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </button>
            <p className="text-nature text-xs font-bold uppercase tracking-widest">Blog Post</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary">Blog post #{params.id}</h1>
            <p className="text-foreground/60 text-lg">This blog post content will be loaded from the database. Check back soon!</p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
