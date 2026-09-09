'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NewsletterUnsubscribePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'unsubscribe' }),
      });
      setSuccess(true);
    } catch {
      setError('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A3C34] flex flex-col justify-between">
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-8">
          {success ? (
            <>
              <CheckCircle className="w-16 h-16 text-nature mx-auto" />
              <h1 className="font-display text-3xl font-bold text-white">Unsubscribed</h1>
              <p className="text-white/60">You have been unsubscribed from our newsletter. You can resubscribe at any time.</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-white">Unsubscribe from Newsletter</h1>
              <p className="text-white/60">Enter your email address to unsubscribe from our newsletter.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-nature transition-all"
                />
                <button type="submit" disabled={loading} className="w-full px-8 py-3 rounded-xl bg-white text-[#1A3C34] font-bold hover:bg-nature hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'Processing...' : 'Unsubscribe'}
                </button>
              </form>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </>
          )}
        </motion.div>
      </section>
    </main>
  );
}
