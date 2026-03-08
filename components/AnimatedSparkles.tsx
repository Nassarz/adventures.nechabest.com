'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Sparkle {
  id: number;
  left: number;
  top: number;
}

export function AnimatedSparkles({ count = 5 }: { count?: number }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Generate sparkles only on client side after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 20 + i * 15,
      top: 30 + i * 10,
    }));
    setSparkles(newSparkles);
  }, [count]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map((sparkle) => {
        const randomX = (sparkle.id % 5) * 4 - 10;
        return (
          <motion.div
            key={sparkle.id}
            animate={{
              y: [0, -30, 0],
              x: [0, randomX, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + sparkle.id,
              repeat: Infinity,
              delay: sparkle.id * 0.8,
              ease: 'easeInOut',
            }}
            className="absolute"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
            }}
            aria-hidden="true"
          >
            <Sparkles className="w-4 h-4 text-white drop-shadow-lg" />
          </motion.div>
        );
      })}
    </div>
  );
}
