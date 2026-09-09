'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export default function BookingPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', tourId: '', tourTitle: '',
    numberOfPeople: 1, startDate: '', endDate: '', totalPrice: 0,
    specialRequests: '', _gotcha: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative h-[40vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">Book Your Adventure</h1>
            <p className="text-white/70 text-lg">Fill out the form below and our team will get back to you within 24 hours.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 space-y-6">
              <CheckCircle className="w-16 h-16 text-nature mx-auto" />
              <h2 className="font-display text-3xl font-bold text-primary">Booking Submitted!</h2>
              <p className="text-foreground/60 text-lg">Thank you for your booking request. Our team will contact you within 24 hours to confirm your adventure.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-[#F8F9FA] p-8 md:p-12 rounded-[2rem] border border-black/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input type="text" placeholder="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
                <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
              </div>
              <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
              <input type="text" placeholder="Tour Name / Package" required value={form.tourTitle} onChange={(e) => setForm({ ...form, tourTitle: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-primary mb-1 block">Number of People</label>
                  <input type="number" min={1} value={form.numberOfPeople} onChange={(e) => setForm({ ...form, numberOfPeople: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary focus:outline-none focus:border-nature transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-primary mb-1 block">Estimated Total ($)</label>
                  <input type="number" min={0} value={form.totalPrice} onChange={(e) => setForm({ ...form, totalPrice: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary focus:outline-none focus:border-nature transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-primary mb-1 block">Start Date</label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary focus:outline-none focus:border-nature transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-primary mb-1 block">End Date (optional)</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary focus:outline-none focus:border-nature transition-all" />
                </div>
              </div>
              <textarea placeholder="Special Requests (optional)" rows={4} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all resize-none" />
              <input type="text" name="_gotcha" value={form._gotcha} onChange={(e) => setForm({ ...form, _gotcha: e.target.value })} tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true" />
              <button type="submit" disabled={loading} className="w-full px-8 py-4 rounded-xl bg-nature text-white font-bold text-lg hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? 'Submitting...' : 'Submit Booking Request'}
              </button>
              {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
            </form>
          )}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
