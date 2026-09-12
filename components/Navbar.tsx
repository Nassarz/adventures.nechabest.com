'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { get } = useSiteContent('home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: get('global.nav.homeLabel', 'Home'), href: '/' },
    { name: get('global.nav.aboutLabel', 'About Us'), href: '/about' },
    { name: get('global.nav.ecoLabel', 'Adventures'), href: '/adventures' },
    { name: get('global.nav.blogLabel', 'Blog'), href: '/blog' },
    { name: get('global.nav.contactLabel', 'Contact Us'), href: '/contact' },
  ].filter((link) => !link.name.toLowerCase().includes('admin'));

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300">
      <div className={`rounded-full px-4 py-2 md:px-8 md:py-3 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : 'bg-white/5 backdrop-blur-md border border-white/5'}`}>
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-white shrink-0">
              <Image
                src="https://iili.io/ffrDkkN.png"
                alt="Nechabest Logo"
                fill
                className="object-contain p-1"
                referrerPolicy="no-referrer"
                unoptimized
              />
            </div>
            <span className={`font-display font-bold text-[11px] sm:text-sm md:text-lg tracking-tight leading-tight max-w-[180px] sm:max-w-[260px] md:max-w-[320px] transition-colors duration-300 ${scrolled ? 'text-[#1A3C34]' : 'text-white'}`}>
              Nechabest
              <br />
              Sustainable Adventures
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold transition-all hover:scale-105 ${scrolled ? 'text-[#1A3C34]/70 hover:text-[#3a9e4f]' : 'text-white/70 hover:text-nature'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-nature text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-primary transition-all shadow-[0_0_30px_rgba(58,158,79,0.2)]"
              >
                {get('global.nav.ctaLabel', 'Book a Tour')}
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-nature/50 ${scrolled ? 'bg-primary/10 text-primary hover:bg-nature hover:text-white' : 'bg-white/10 text-white hover:bg-nature hover:text-white'}`}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden mt-4 rounded-[2rem] bg-white/95 backdrop-blur-2xl border border-black/5 overflow-hidden shadow-2xl will-change-transform"
          >
            <div className="px-6 py-8 flex flex-col min-h-[60vh]">
              <div className="space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setIsOpen(false)}
                    className="block text-xl font-bold text-[#1A3C34]/70 hover:text-nature transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <a href="/booking" onClick={() => setIsOpen(false)} className="w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-center bg-nature text-white px-6 py-4 rounded-2xl font-bold mt-6 shadow-lg"
                  >
                    {get('global.nav.ctaLabel', 'Book a Tour')}
                  </motion.button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
