'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/useSiteContent';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { WhatsAppLogoIcon } from '@/components/FloatingWhatsApp';

const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/nechabest/',
  facebook: 'https://www.facebook.com/people/Nechabest-Sustainable-Initiatives/61576490034369/',
  x: 'https://x.com/nechabest',
  tiktok: 'https://www.tiktok.com/@nechabest',
};

interface BrandIconProps {
  className?: string;
}

function InstagramIcon({ className = 'w-5 h-5' }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon({ className = 'w-5 h-5' }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-5 h-5' }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function Footer() {
  const { get } = useSiteContent('home');
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState('');
  const [gotcha, setGotcha] = useState(''); // Honeypot
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          _gotcha: gotcha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to subscribe.');
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#1A3C34] text-white pt-24 pb-8 overflow-hidden relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand & Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 will-change-transform"
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12">
                <Image 
                  src="https://iili.io/ffrDkkN.png" 
                  alt="Nechabest Logo" 
                  fill 
                  className="object-contain"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              </div>
              <div>
                <span className="block font-display font-bold text-2xl tracking-tighter leading-none">
                  {get('global.nav.logoTextMobile', 'Nechabest')}
                </span>
                <span className="text-[10px] text-nature font-bold uppercase tracking-widest">
                  {get('global.footer.brandSubLabel', 'Sustainable Initiatives')}
                </span>
              </div>
            </Link>
            <p className="text-nature font-bold text-lg tracking-tight">{get('global.footer.tagline', 'Together for a Greener Future.')}</p>
            <p className="text-white/40 leading-relaxed text-sm font-medium">
              {get('global.footer.description', 'Building climate-resilient communities through sustainable innovation, conservation, and empowerment.')}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:pl-8 will-change-transform"
          >
            <h4 className="font-display text-xl font-bold mb-8 text-white tracking-tight">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Eco-Tourism', href: '/eco-tourism' },
                { label: 'Book a Tour', href: '/booking' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/30 hover:text-nature transition-all flex items-center gap-2 group text-sm font-bold">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Our Services */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="will-change-transform"
          >
            <h4 className="font-display text-xl font-bold mb-8 text-white tracking-tight">Our Services</h4>
            <ul className="space-y-4">
              {[
                'Environmental Consultancy',
                'WEF Nexus Solutions',
                'Eco-Tourism Packages',
                'Capacity Building',
                'Research & Innovation'
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/30 hover:text-nature transition-all flex items-center gap-2 group text-sm font-bold">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Us */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-6 will-change-transform"
          >
            <h4 className="font-display text-xl font-bold mb-8 text-white tracking-tight">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-nature shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-white mb-1">Head Office</p>
                  <p className="text-white/40 leading-snug font-medium">
                    Kasangati Town Council, Plot 616 Block 174, Kabanyolo, Kyadondo County, Wakiso District
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-nature shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-white mb-1">Email</p>
                  <p className="text-white/40 font-medium">{get('global.footer.emailPrimary', 'info@nechabest.com')}</p>
                  <p className="text-white/40 font-medium">{get('global.footer.emailSecondary', 'research@nechabest.com')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="w-5 h-5 text-nature shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-white mb-1">Phone</p>
                  <p className="text-white/40 font-medium">{get('global.footer.phone', '+256 763 860866')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stay Connected & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12 border-t border-white/5 items-center">
          <div className="space-y-6">
            <h4 className="font-display text-xl font-bold text-white tracking-tight">Stay Connected</h4>
            <p className="text-white/40 text-sm max-w-md font-medium">
              Subscribe to receive our latest news, project updates, and sustainability insights.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: InstagramIcon, href: SOCIAL_LINKS.instagram, label: 'Instagram' },
                { Icon: FacebookIcon, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
                { Icon: XIcon, href: SOCIAL_LINKS.x, label: 'X (Twitter)' },
                { Icon: TikTokIcon, href: SOCIAL_LINKS.tiktok, label: 'TikTok' },
                { Icon: WhatsAppLogoIcon, href: buildWhatsAppLink('Hello Nechabest Sustainable Initiatives!'), label: 'WhatsApp' },
              ].map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Nechabest on ${social.label}`}
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-nature transition-all border border-white/10 group will-change-transform"
                >
                  <social.Icon className="w-5 h-5 text-white/20 group-hover:text-black transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>
          <div className="relative">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setSuccess(false);
                }}
                placeholder="Enter your email" 
                required
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-nature/50 transition-all font-medium disabled:opacity-50"
              />
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
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-nature text-black font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,0,0.1)] disabled:opacity-50"
              >
                {loading ? 'Subscribing...' : 'Subscribe'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
            {success && (
              <p className="text-nature text-xs font-bold mt-2">
                Thank you for subscribing!
              </p>
            )}
            {error && (
              <p className="text-red-400 text-xs font-bold mt-2">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <p>
            © {currentYear} Nechabest Sustainable Initiatives. All Rights Reserved. |{' '}
            <a
              href="https://wa.me/789649710"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Developed by IN&apos;TCODE
            </a>
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
