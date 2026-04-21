'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

const slides = [
  {
    title: 'Who We Are',
    desc: 'Nechabest Sustainable Initiatives is building climate-resilient, environmentally conscious communities through research, innovation, and local empowerment.',
    cta: 'Learn More About Us →',
    image: 'https://iili.io/fdC0KF9.jpg'
  },
  {
    title: 'Our Vision',
    desc: 'Bridging the gap between environmental conservation and community development through smart, solar-powered initiatives and local action.',
    cta: 'Our Vision →',
    image: 'https://iili.io/fdClSYg.png'
  },
  {
    title: 'Our Mission',
    desc: 'To create sustainable solutions where people and nature thrive together, ensuring conservation is a lived reality for the people we serve.',
    cta: 'Our Mission →',
    image: 'https://iili.io/fdC0KF9.jpg'
  }
];

export default function AboutSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { get } = useSiteContent('home');

  const dynamicSlides = [
    {
      title: get('home.about.slide1.title', slides[0].title),
      desc: get('home.about.slide1.desc', slides[0].desc),
      cta: get('home.about.slide1.cta', slides[0].cta),
      image: get('home.about.slide1.image', slides[0].image),
    },
    {
      title: get('home.about.slide2.title', slides[1].title),
      desc: get('home.about.slide2.desc', slides[1].desc),
      cta: get('home.about.slide2.cta', slides[1].cta),
      image: get('home.about.slide2.image', slides[1].image),
    },
    {
      title: get('home.about.slide3.title', slides[2].title),
      desc: get('home.about.slide3.desc', slides[2].desc),
      cta: get('home.about.slide3.cta', slides[2].cta),
      image: get('home.about.slide3.image', slides[2].image),
    },
  ];

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % dynamicSlides.length);
  }, [dynamicSlides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + dynamicSlides.length) % dynamicSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="bg-[#F8F9FA] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-black/5 flex flex-col lg:flex-row min-h-[500px] md:min-h-[600px]">
          {/* Image Section */}
          <div className="lg:w-1/2 relative overflow-hidden h-[280px] md:h-[400px] lg:h-auto bg-primary/10">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 will-change-transform"
              >
                <Image
                  src={dynamicSlides[currentIndex].image}
                  alt={dynamicSlides[currentIndex].title}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                  priority={currentIndex === 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 p-8 md:p-20 flex flex-col justify-center relative bg-white">
            <div className="relative min-h-[300px] md:min-h-[400px] flex flex-col justify-center">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 30 * (direction || 1) }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 * (direction || 1) }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6 md:space-y-8 absolute inset-0 flex flex-col justify-center will-change-transform"
                  role="region"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1A3C34] leading-tight">
                    {dynamicSlides[currentIndex].title}
                  </h2>
                  <div className="w-12 md:w-16 h-1 bg-[#1A3C34] rounded-full" />
                  <p className="text-lg md:text-2xl text-foreground/70 leading-relaxed max-w-lg">
                    {dynamicSlides[currentIndex].desc}
                  </p>
                  <div>
                    <button className="text-lg md:text-xl font-bold text-[#1A3C34] hover:text-nature transition-colors flex items-center gap-2 group">
                      {dynamicSlides[currentIndex].cta}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation - Fixed position relative to content container */}
            <div className="mt-auto pt-10 md:pt-16 flex items-center justify-between relative z-10">
              <div className="flex gap-3 md:gap-4">
                <button 
                  onClick={prevSlide}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-black/10 flex items-center justify-center hover:bg-[#1A3C34] hover:text-white transition-all group focus:outline-none focus:ring-4 focus:ring-[#1A3C34]/30"
                  aria-label="Previous slide"
                >
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1A3C34] text-white flex items-center justify-center hover:bg-nature transition-all shadow-lg shadow-[#1A3C34]/20 focus:outline-none focus:ring-4 focus:ring-nature/50"
                  aria-label="Next slide"
                >
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 max-w-[120px] md:max-w-[200px] ml-6 md:ml-12">
                <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#1A3C34]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentIndex + 1) / dynamicSlides.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
