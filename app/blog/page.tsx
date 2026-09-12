'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Link from 'next/link';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  category: string;
  date: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-nature/60" />
              <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px]">Blog</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">Travel Stories & Tips</h1>
            <p className="text-white/70 text-lg max-w-2xl">Insights, guides, and stories from our adventures across Uganda.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-nature animate-spin" /></div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-foreground/60 text-lg">Blog posts coming soon!</p>
              <p className="text-foreground/40">We&apos;re working on exciting travel stories and guides.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, i) => (
                <motion.div key={blog.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/blog/${blog.id}`} className="group block bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-black/10">
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <Image src={blog.image} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-6 space-y-4">
                      <span className="text-nature text-xs font-bold uppercase tracking-widest">{blog.category}</span>
                      <h3 className="font-display text-xl font-bold text-primary group-hover:text-nature transition-colors">{blog.title}</h3>
                      <p className="text-foreground/60 text-sm line-clamp-2">{blog.excerpt}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-black/5">
                        <span className="text-xs text-foreground/40 font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> {blog.date}</span>
                        <span className="text-nature text-xs font-bold flex items-center gap-1">Read More <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
