'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '#about' },
    { name: 'Eco-Tourism', href: '#tours' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact Us', href: '#contact' },
  ];

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300">
      <div className={`rounded-full px-4 py-2 md:px-8 md:py-3 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'bg-white/5 backdrop-blur-md border border-white/5'}`}>
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-white shrink-0">
              <Image 
                src="https://iili.io/ffrDkkN.png" 
                alt="Nechabest Logo" 
                fill 
                className="object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-bold text-sm sm:text-base md:text-xl tracking-tighter text-white leading-tight max-w-[140px] sm:max-w-[200px] md:max-w-none">
              <span className="hidden sm:inline">Nechabest Sustainable Initiatives</span>
              <span className="sm:hidden">Nechabest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-white/70 transition-all hover:text-nature hover:scale-105"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <button onClick={() => signOut(auth)} className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-nature transition-all">
                Sign Out
              </button>
            ) : (
              <Link
                href="#contact"
                className="bg-nature text-black px-8 py-2.5 rounded-full text-sm font-bold hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)]"
              >
                Join Us
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-nature hover:text-black transition-all"
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
            className="lg:hidden mt-4 rounded-[2rem] bg-black/90 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl will-change-transform"
          >
            <div className="px-6 py-8 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold text-white/70 hover:text-nature transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-nature text-black px-6 py-4 rounded-2xl font-bold mt-6 shadow-[0_0_30px_rgba(0,255,0,0.2)]"
              >
                Join Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
