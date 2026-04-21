'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSlideshowProps {
  images: string[];
  interval?: number; // ms between slides, default 6000
  overlay?: string;  // tailwind gradient class
  children?: React.ReactNode;
  className?: string;
}

export default function HeroSlideshow({
  images,
  interval = 6000,
  overlay = 'bg-gradient-to-br from-black/70 via-black/40 to-black/70',
  children,
  className = '',
}: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const validImages = images.filter(Boolean);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validImages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [validImages.length, interval]);

  return (
    <div className={`absolute inset-0 z-0 bg-black ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{ backgroundImage: `url("${validImages[current]}")` }}
          role="img"
          aria-label={`Hero image ${current + 1}`}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlay}`} />

      {/* Dot indicators — only shown when more than 1 image */}
      {validImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
