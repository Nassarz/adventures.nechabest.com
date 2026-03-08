'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Clock, Heart, MessageCircle, Send, ArrowLeft, Share2, Bookmark, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

type BlogComment = {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt?: string;
};

type RelatedPost = {
  id: string;
  title: string;
  category?: string;
  readTime?: string;
  image?: string;
};

type BlogPost = {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  date?: string;
  author?: string;
  avatar?: string;
  image?: string;
  category?: string;
  readTime?: string;
  likes?: number;
  views?: number;
  createdAt?: string;
  comments?: BlogComment[];
  relatedPosts?: RelatedPost[];
};

export default function BlogDetail() {
  const params = useParams();
  const postId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState('');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/blogs/${postId}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch blog details');
        }

        const data = (await response.json()) as BlogPost;
        setPost(data);
        setComments(data.comments || []);
        setRelatedPosts(data.relatedPosts || []);
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError('Unable to load this blog post right now.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !newComment.trim()) {
      setCommentMessage('Please fill in name, email, and comment.');
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentMessage('');

      const response = await fetch(`/api/blogs/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          comment: newComment,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to submit comment');
      }

      setNewComment('');
      setCommentMessage(result?.message || 'Comment submitted successfully.');
    } catch (err) {
      console.error('Error posting comment:', err);
      setCommentMessage('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-nature" />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 text-center">
        <p className="text-lg">{error || 'Blog post not found.'}</p>
      </main>
    );
  }

  const displayDate = post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent');
  const displayImage = post.image || 'https://picsum.photos/seed/blog/1200/800';
  const displayAvatar = post.avatar || `https://picsum.photos/seed/${post.author || 'author'}/100/100`;

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black selection:bg-nature selection:text-black">
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />

        <section className="relative h-[60vh] md:h-[70vh] overflow-hidden pt-20">
          <Image
            src={displayImage}
            alt={post.title}
            fill
            className="object-cover brightness-50"
            priority
            referrerPolicy="no-referrer"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 pb-12 md:pb-16">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
              <motion.a
                href="/blog"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition font-bold text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </motion.a>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-4"
              >
                <span className="inline-block px-4 py-2 rounded-full bg-nature/20 backdrop-blur-xl text-nature border border-nature/30 text-xs font-bold uppercase tracking-widest">
                  {post.category || 'Blog'}
                </span>

                <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/80 text-sm">
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <Image
                        src={displayAvatar}
                        alt={post.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                      <span className="font-bold">{post.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {displayDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime || '5 min'} read
                  </div>
                  {typeof post.views === 'number' && <div className="flex items-center gap-1">{post.views} views</div>}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between pb-8 border-b border-black/10 mb-12"
            >
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setLiked((prev) => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition ${
                    liked ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-foreground/60 hover:bg-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-600' : ''}`} />
                  {(post.likes || 0) + (liked ? 1 : 0)}
                </motion.button>

                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-foreground/60 font-bold text-sm">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setBookmarked((prev) => !prev)}
                  className={`p-2 rounded-full transition ${
                    bookmarked ? 'bg-nature/10 text-nature' : 'bg-slate-100 text-foreground/60 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-nature' : ''}`} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-slate-100 text-foreground/60 hover:bg-slate-200 transition"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="prose prose-lg max-w-none"
            >
              {(post.content || post.excerpt || '')
                .split('\n\n')
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i} className="text-foreground/80 leading-relaxed mb-6 text-base md:text-lg">
                    {paragraph}
                  </p>
                ))}
            </motion.article>

            {post.author && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-16 p-8 bg-slate-50 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={displayAvatar}
                    alt={post.author}
                    width={80}
                    height={80}
                    className="rounded-full"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                  <div>
                    <h3 className="font-bold text-xl text-primary mb-2">{post.author}</h3>
                    <p className="text-foreground/60 leading-relaxed">
                      Contributor at Nechabest sharing practical insights on sustainability and eco-tourism.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16"
            >
              <h3 className="font-bold text-2xl md:text-3xl text-primary mb-8">Comments ({comments.length})</h3>

              <form onSubmit={handleCommentSubmit} className="mb-12 bg-slate-50 rounded-2xl p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium focus:outline-none focus:border-primary"
                    required
                  />
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 bg-white font-medium focus:outline-none focus:border-primary resize-none"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submittingComment}
                  className="bg-gradient-to-r from-primary to-nature text-white font-bold py-3 px-6 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </motion.button>
                {commentMessage && <p className="text-sm text-foreground/70">{commentMessage}</p>}
              </form>

              <div className="space-y-6">
                {comments.map((comment, i) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="bg-slate-50 rounded-xl p-6 space-y-3"
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        src={comment.avatar || '/icons/comment-default.svg'}
                        alt={comment.author}
                        width={48}
                        height={48}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-foreground">{comment.author}</h4>
                          <span className="text-xs text-foreground/60">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <p className="text-foreground/70 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {relatedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-20"
              >
                <h3 className="font-bold text-2xl md:text-3xl text-primary mb-8">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost, i) => (
                    <motion.a
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="group bg-slate-50 rounded-xl overflow-hidden hover:shadow-xl transition-all"
                    >
                      <div className="aspect-video relative">
                        <Image
                          src={relatedPost.image || 'https://picsum.photos/seed/blog/800/600'}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="text-xs font-bold text-nature uppercase tracking-widest">{relatedPost.category || 'Blog'}</span>
                        <h4 className="font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-foreground/60">{relatedPost.readTime || '5 min'} read</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
