'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { get } = useSiteContent('home');

  const HERO_IMAGES = [
    get('home.hero.image1', 'https://iili.io/fdC0KF9.jpg'),
    get('home.hero.image2', 'https://iili.io/fdClSYg.png'),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [HERO_IMAGES.length]);

  const titleWords = 'Unforgettable Adventures Await.'.split(' ');

  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0 bg-black">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat blur-[4px] transition-opacity duration-[1200ms] ${i === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url("${img}")` }}
            role="img"
            aria-label={`Hero image ${i + 1}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 pt-28 md:pt-32">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center gap-3"
            >
              <span className="w-8 h-[1px] bg-nature/60" />
              <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px]">
                Nechabest Sustainable Adventures
              </span>
              <span className="w-8 h-[1px] bg-nature/60" />
            </motion.div>

            {/* Word-by-word slide-up title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-white font-bold leading-[1.1] tracking-tight">
              {titleWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`inline-block mr-[0.3em] ${i === 2 || i === 3 ? 'italic text-[#3a9e4f]' : ''}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              {get('home.hero.subtitle', 'Gorilla trekking, wildlife safaris, mountain hiking, and cultural immersion — your ultimate Uganda adventure starts here.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <motion.a
                href="#tours"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-nature text-white font-bold text-sm shadow-2xl shadow-nature/40 hover:bg-white hover:text-nature transition-all text-center"
              >
                Explore Tours
              </motion.a>
              <motion.a
                href="/booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold text-sm hover:bg-white hover:text-primary transition-all text-center"
              >
                Book Now
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 right-12 hidden md:flex flex-col items-center gap-4"
      >
        <button
          onClick={() => document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-16 h-16 rounded-full glass flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-nature/50"
          aria-label="Scroll down to tours"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </motion.div>
    </section>
  );
}
