'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(timer);
  }, [HERO_IMAGES.length]);

  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden">
      {/* Background Slideshow with Overlay */}
      <div className="absolute inset-0 z-0 bg-black">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[4px] will-change-transform"
            style={{ 
              backgroundImage: `url("${HERO_IMAGES[currentImageIndex]}")`,
            }}
            role="img"
            aria-label={`Hero image ${currentImageIndex + 1}`}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-0">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8"
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white font-normal leading-[1.1] tracking-tight">
              {get('home.hero.title', 'Building a Sustainable Future for People and Nature.')}
            </h1>
            
            <p className="text-lg md:text-2xl text-white/90 font-medium leading-relaxed max-w-3xl mx-auto">
              {get('home.hero.subtitle', 'Empowering Ugandan communities through clean water, renewable energy, climate-smart farming, and eco-tourism.')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <motion.a
                href="#about"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-nature text-white font-bold text-lg shadow-2xl shadow-nature/40 hover:bg-white hover:text-nature transition-all text-center"
                aria-label="Explore our sustainable development work"
              >
                Explore Our Work
              </motion.a>
              <motion.a
                href="#tours"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold text-lg hover:bg-white hover:text-primary transition-all text-center"
                aria-label="Book an eco-tourism tour"
              >
                Book a Tour
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 right-12 hidden md:flex flex-col items-center gap-4"
      >
        <button 
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-16 h-16 rounded-full glass flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-nature/50"
          aria-label="Scroll down to about section"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </motion.div>
    </section>
  );
}
