'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  isVisible: boolean;
}

export default function LoadingSpinner({ isVisible }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      className="fixed inset-0 bg-black z-[99999] flex items-center justify-center"
    >
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Main Spinner */}
        <div className="relative w-24 h-24">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-[3px] border-transparent border-t-nature border-r-nature rounded-full"
          />

          {/* Middle rotating ring - slower */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 border-[2px] border-transparent border-b-nature border-l-nature rounded-full"
          />

          {/* Inner pulsing dot */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              boxShadow: [
                '0 0 0 0 rgba(0, 255, 0, 0.7)',
                '0 0 0 15px rgba(0, 255, 0, 0)',
                '0 0 0 0 rgba(0, 255, 0, 0)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 m-auto w-3 h-3 bg-nature rounded-full"
          />
        </div>

        {/* Loading Text with Animation */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-center"
          >
            <h3 className="text-white font-display text-xl font-bold tracking-wider">
              Navigating
            </h3>
            <motion.div
              className="flex gap-1 justify-center mt-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                  className="w-1.5 h-1.5 bg-nature rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Loading Bar */}
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ 
                x: [-128, 128],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="h-full w-16 bg-gradient-to-r from-transparent via-nature to-transparent rounded-full"
            />
          </div>
        </div>

        {/* Eco-themed Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating leaf elements */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -300, -320],
                x: [0, Math.cos(i) * 100 - 50, Math.cos(i) * 120 - 60],
                opacity: [0, 0.6, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
              className="absolute bottom-0 left-1/2 w-2 h-2 bg-nature rounded-full"
              style={{
                transform: 'translateX(50%)',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
