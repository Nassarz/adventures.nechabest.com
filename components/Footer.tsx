'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function Footer() {
  const { get } = useSiteContent('home');

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
              {['Home', 'About Us', 'WEF Projects', 'Eco-Tourism', 'Research', 'Partnerships', 'Blog'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/30 hover:text-nature transition-all flex items-center gap-2 group text-sm font-bold">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0" />
                    {item}
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
                { Icon: Linkedin, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Facebook, href: '#' },
                { Icon: Youtube, href: '#' }
              ].map((social, i) => (
                <motion.a 
                  key={i} 
                  href={social.href} 
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-nature transition-all border border-white/10 group will-change-transform"
                >
                  <social.Icon className="w-5 h-5 text-white/20 group-hover:text-black transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-nature/50 transition-all font-medium"
              />
              <button className="px-8 py-4 rounded-2xl bg-nature text-black font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,0,0.1)]">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <p>
            © 2025 Nechabest Sustainable Initiatives. All Rights Reserved. |{' '}
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
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
