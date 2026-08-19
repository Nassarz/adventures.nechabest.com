'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [gotcha, setGotcha] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Extract email from query parameter on mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, _gotcha: gotcha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubscribe.');
      }

      setSuccess(true);
      
      // Auto-redirect to home page after 3.5 seconds
      setTimeout(() => {
        router.push('/');
      }, 3500);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 bg-nature/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-nature" />
          </div>
          <h2 className="text-2xl font-bold text-white">Unsubscribed</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            You have successfully unsubscribed from the Nechabest newsletter.<br />
            We&apos;re sorry to see you go!
          </p>
          <p className="text-nature font-bold text-xs">
            Redirecting you to the home page...
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <Mail className="w-10 h-10 text-nature" />
            </div>
            <h2 className="text-2xl font-bold text-white">Cancel Subscription</h2>
            <p className="text-white/70 text-xs leading-relaxed">
              Enter your email address to stop receiving newsletter alerts from Nechabest.
            </p>
          </div>

          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <label className="block text-white/80 text-xs font-bold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@domain.com"
                required
                disabled={loading}
                className="w-full px-5 py-3.5 rounded-2xl border bg-white/8 text-white text-sm font-medium placeholder-white/30 transition focus:outline-none border-white/25 focus:border-nature/70 focus:bg-white/12 disabled:opacity-50"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Honeypot field - hidden from users, catches bots */}
            <input
              type="text"
              value={gotcha}
              onChange={(e) => setGotcha(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full px-6 py-3.5 rounded-2xl bg-nature text-black font-bold text-sm uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,0,0.15)] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Unsubscribe'}
            </motion.button>
          </form>

          <div className="pt-2 text-center">
            <Link 
              href="/" 
              className="text-white/50 hover:text-nature text-xs font-bold inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="relative min-h-screen bg-[#1A3C34] flex flex-col justify-between overflow-hidden">
      <Navbar />

      {/* Hero background overlay details */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(88,176,92,0.15),transparent_60%)]" />

      <section className="flex-1 flex items-center justify-center pt-32 pb-16 px-4 relative z-10">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center text-white font-bold">
            Loading...
          </div>
        }>
          <UnsubscribeContent />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}
