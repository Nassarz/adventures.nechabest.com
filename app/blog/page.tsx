'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Heart, Calendar, Clock, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSiteContent } from '@/hooks/useSiteContent';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  author?: string;
  avatar?: string;
  image: string;
  category?: string;
  readTime?: string;
  likes?: number;
  views?: number;
  createdAt?: string;
}

const categories = ['All', 'Sustainability', 'Travel Guide', 'Conservation', 'Eco-Living', 'Culture', 'Photography'];

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { get } = useSiteContent('blog');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const data = await response.json();
      setBlogPosts(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = blogPosts.filter((post) => 
    selectedCategory === 'All' || post.category === selectedCategory
  );

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black selection:bg-nature selection:text-black">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40">
          <Image
            src={get('blog.hero.image', 'https://picsum.photos/seed/blog-hero/2560/1440')}
            alt="Blog Hero"
            fill
            className="object-cover absolute inset-0 brightness-50"
            priority
            referrerPolicy="no-referrer"
          />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-nature" />
                <span className="text-nature font-bold uppercase tracking-[0.2em] text-xs">Insights & Stories</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                {get('blog.hero.title', 'Eco-Insights')}
              </h1>

              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                {get('blog.hero.subtitle', 'Stories, research, and practical guides on sustainable travel and conservation across Africa')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 md:py-16 bg-white border-t border-b border-black/10">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-3 justify-center md:justify-start"
            >
              {categories.map((category, i) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-white shadow-xl'
                      : 'bg-slate-100 text-foreground/60 hover:bg-slate-200 border border-black/5'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-nature animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {filteredPosts.map((post, i) => {
                  const category = post.category || 'Uncategorized';
                  const displayDate = post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent');
                  const readTime = post.readTime || '5 min';
                  
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="group bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-black/10 hover:border-nature/30 will-change-transform"
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] relative overflow-hidden bg-slate-200">
                        <Image
                          src={post.image || 'https://picsum.photos/seed/blog/800/600'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Category Badge */}
                        <div className="absolute top-6 right-6">
                          <span className="px-4 py-2 rounded-full bg-nature/10 backdrop-blur-xl text-nature text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-nature/20">
                            {category}
                          </span>
                        </div>

                        {/* Like Button */}
                        <button className="absolute top-6 left-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:bg-nature hover:text-white transition-all border border-white/30">
                          <Heart className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        {/* Views Counter */}
                        {post.views && post.views > 0 && (
                          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xl text-white text-[10px] font-bold">
                            {post.views} views
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-8 md:p-10 space-y-6 md:space-y-8">
                        <div className="space-y-3 md:space-y-4">
                          <h3 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight group-hover:text-nature transition-colors tracking-tight">
                            {post.title}
                          </h3>
                          
                          <p className="text-foreground/60 text-base leading-relaxed line-clamp-2">
                            {post.excerpt || 'Read this article to learn more...'}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-4 py-4 md:py-6 border-y border-black/10">
                          {post.author && (
                            <div className="flex items-center gap-3">
                              <Image
                                src={post.avatar || `https://picsum.photos/seed/${post.author}/100/100`}
                                alt={post.author}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                                unoptimized
                              />
                              <div>
                                <p className="font-bold text-primary text-sm">{post.author}</p>
                                <div className="flex items-center gap-2 text-foreground/60 text-xs font-bold uppercase tracking-widest">
                                  <Calendar className="w-3 h-3" />
                                  {displayDate}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-foreground/60 text-xs md:text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-nature" />
                              {readTime} read
                            </div>
                            {post.likes && post.likes > 0 && (
                              <div className="flex items-center gap-1 text-nature">
                                <Heart className="w-3 h-3 fill-nature" />
                                {post.likes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CTA Button */}
                        <motion.a
                          href={`/blog/${post.id}`}
                          whileHover={{ x: 4 }}
                          className="w-full group/btn flex items-center justify-between bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm md:text-base px-4 py-3 md:py-4 rounded-xl transition-all border border-primary/20 hover:border-primary/50"
                        >
                          Read Full Article
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </motion.a>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-xl text-foreground/60 font-medium">No articles found in this category.</p>
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
