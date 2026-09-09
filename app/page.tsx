'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Tours from '@/components/Tours';
import Impact from '@/components/Impact';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import ErrorBoundary from '@/components/ErrorBoundary';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black selection:bg-nature selection:text-white">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(58,158,79,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />
        <Hero />

        <div className="relative z-10 bg-black">
          <Tours />
          <Impact />
        </div>

        <Footer />
        <FloatingWhatsApp />
      </main>
    </ErrorBoundary>
  );
}
