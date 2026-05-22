'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

// This page only renders in development mode.
// In production it is unreachable because the admin layout
// redirects to /sign-in (Clerk) instead of /admin/dev-login.
export default function DevAdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/dev-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid password');
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Dev mode badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Development Mode
          </span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Admin Access</h1>
          <p className="text-white/50 text-sm text-center mb-8">
            Enter the <code className="text-green-400 bg-white/5 px-1.5 py-0.5 rounded">DEV_ADMIN_PASSWORD</code> from your <code className="text-green-400 bg-white/5 px-1.5 py-0.5 rounded">.env.local</code>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Admin password"
                autoComplete="current-password"
                autoFocus
                className="w-full bg-white/8 border border-white/15 text-white placeholder-white/30 rounded-xl px-5 py-3.5 pr-12 focus:outline-none focus:border-green-500/60 focus:bg-white/12 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/30 text-xs text-center leading-relaxed">
              This login is only available in development.<br />
              Production uses Clerk authentication at{' '}
              <span className="text-white/50">nechabest.com</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
