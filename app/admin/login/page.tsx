'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A3C34] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-primary">Admin Login</h1>
          <p className="text-foreground/60 text-sm mt-2">Nechabest Adventures Admin Panel</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
          <button type="submit" disabled={loading} className="w-full px-8 py-3 rounded-xl bg-nature text-white font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </motion.div>
    </div>
  );
}
