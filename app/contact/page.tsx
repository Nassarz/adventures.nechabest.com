'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function ContactPage() {
  const { get } = useSiteContent('contact');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', _gotcha: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '', _gotcha: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-nature/60" />
              <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px]">Get In Touch</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
              {get('contact.hero.title', 'Contact Us')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="font-display text-3xl font-bold text-primary">Let&apos;s Talk</h2>
            <p className="text-foreground/60 text-lg">Have questions about our tours? Want to plan a custom adventure? We&apos;d love to hear from you.</p>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: 'Address', value: 'Kasangati Town Council, Wakiso District, Uganda' },
                { icon: Mail, label: 'Email', value: get('contact.email', 'info@nechabest.com') },
                { icon: Phone, label: 'Phone', value: get('contact.phone', '+256 756 310029') },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-nature/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-nature" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{item.label}</p>
                    <p className="text-foreground/60">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#F8F9FA] p-8 md:p-12 rounded-[2rem] border border-black/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input type="text" placeholder="Your Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
              <input type="email" placeholder="Your Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
            </div>
            <input type="text" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
            <input type="text" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all" />
            <textarea placeholder="Your Message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-primary placeholder:text-foreground/30 focus:outline-none focus:border-nature transition-all resize-none" />
            <input type="text" name="_gotcha" value={form._gotcha} onChange={(e) => setForm({ ...form, _gotcha: e.target.value })} tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true" />
            <button type="submit" disabled={loading} className="w-full px-8 py-4 rounded-xl bg-nature text-white font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            {success && <p className="text-nature text-sm font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Message sent successfully!</p>}
            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          </form>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
