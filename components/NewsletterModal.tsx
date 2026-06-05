'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Check } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gotcha, setGotcha] = useState(''); // Honeypot field
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Submit to internal API endpoint which handles DB saving & Formspree notification
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          _gotcha: gotcha, // Honeypot for bot protection
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to subscribe');
      }

      setSubmitted(true);
      setEmail('');
      setName('');

      // Close after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Full screen with strong blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 z-50"
            style={{ 
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
            }}
          />

          {/* Modal Container - Absolutely positioned center */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 350, duration: 0.4 }}
              className="relative bg-black/95 backdrop-blur-2xl border-2 border-white/25 rounded-3xl p-11 md:p-12 shadow-2xl w-full max-w-md"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 bg-nature/30 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-nature" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white">Thanks for Subscribing!</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    We&apos;ll keep you updated with eco-tourism tips and exclusive offers.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <div className="flex justify-center mb-2">
                      <Mail className="w-10 h-10 text-nature" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Join Our Newsletter</h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Get eco-tourism updates, sustainability tips, and exclusive offers delivered to your inbox.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name (optional)"
                        autoComplete="name"
                        disabled={loading}
                        className="w-full px-6 py-3.5 rounded-2xl border-2 bg-white/8 text-white text-sm font-medium placeholder-white/50 transition-all focus:outline-none border-white/25 focus:border-nature/70 focus:bg-white/12 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="Your email"
                        autoComplete="email"
                        required
                        disabled={loading}
                        className={`w-full px-6 py-3.5 rounded-2xl border-2 bg-white/8 text-white text-sm font-medium placeholder-white/50 transition-all focus:outline-none disabled:opacity-50 ${
                          error
                            ? 'border-red-400/60 focus:border-red-400 bg-red-500/10'
                            : 'border-white/25 focus:border-nature/70 focus:bg-white/12'
                        }`}
                      />
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-300 text-xs font-medium mt-2"
                        >
                          {error}
                        </motion.p>
                      )}
                    </div>

                    {/* Honeypot field - hidden from users, catches bots */}
                    <input
                      type="text"
                      name="_gotcha"
                      value={gotcha}
                      onChange={(e) => setGotcha(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      style={{
                        position: 'absolute',
                        left: '-9999px',
                        width: '1px',
                        height: '1px',
                        opacity: 0,
                        pointerEvents: 'none'
                      }}
                      aria-hidden="true"
                    />

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.03 }}
                      whileTap={{ scale: loading ? 1 : 0.97 }}
                      className="w-full px-6 py-3.5 rounded-2xl bg-gradient-to-r from-nature via-nature to-nature/90 text-black font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-nature/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                          />
                          Subscribing...
                        </>
                      ) : (
                        'Subscribe'
                      )}
                    </motion.button>
                  </form>

                  {/* Privacy Notice */}
                  <p className="text-center text-xs text-white/50 leading-relaxed">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </>
              )}
              </div>
            </motion.div>
            </div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal outside of Navbar's stacking context
  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
