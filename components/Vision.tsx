'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    title: 'Our Vision',
    desc: 'Bridging the gap between environmental conservation and community development through smart, solar-powered initiatives and local action.',
    image: 'https://iili.io/fdC0KF9.jpg'
  },
  {
    title: 'Our Mission',
    desc: 'To empower local communities with sustainable tools and knowledge to protect their natural heritage while improving their quality of life.',
    image: 'https://iili.io/fdClSYg.png'
  },
  {
    title: 'Our Impact',
    desc: 'Creating measurable change through reforestation, clean energy access, and climate-smart agricultural practices across Uganda.',
    image: 'https://iili.io/3oebjFS.jpg'
  }
];

export default function Vision() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="vision" className="relative py-16 md:py-32 bg-[#000000] overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />

      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#020C08] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 will-change-transform"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Side */}
            <div className="relative aspect-[16/10] lg:aspect-auto h-[300px] md:h-[500px] lg:h-auto overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 will-change-transform"
                >
                  <Image
                    src={slides[current].image}
                    alt={slides[current].title}
                    fill
                    className="object-cover brightness-75"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020C08] via-transparent to-transparent hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020C08] via-transparent to-transparent lg:hidden" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content Side */}
            <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center space-y-6 md:space-y-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4 md:space-y-6 will-change-transform"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-nature/30" />
                    <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Our Purpose</span>
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-none">
                    {slides[current].title.split(' ')[0]} <span className="italic font-light text-nature">{slides[current].title.split(' ')[1]}</span>
                  </h2>
                  <p className="text-base md:text-xl text-white/50 leading-relaxed max-w-lg font-medium">
                    {slides[current].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-row items-center justify-between pt-4 md:pt-8 gap-6">
                <div className="flex gap-3 md:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all will-change-transform"
                  >
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-nature flex items-center justify-center text-black hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)] will-change-transform"
                  >
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.button>
                </div>

                {/* Pagination */}
                <div className="flex gap-2 md:gap-3">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`transition-all duration-700 rounded-full h-1.5 md:h-2 ${i === current ? 'w-8 md:w-12 bg-nature' : 'w-1.5 md:w-2 bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
