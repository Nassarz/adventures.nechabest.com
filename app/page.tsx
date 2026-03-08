'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSlideshow from '@/components/AboutSlideshow';
import FocusAreas from '@/components/FocusAreas';
import Tours from '@/components/Tours';
import Impact from '@/components/Impact';
import FeaturedProjects from '@/components/FeaturedProjects';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { motion, useScroll, useSpring } from 'motion/react';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black selection:bg-nature selection:text-black">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />
        
        <Hero />
        
        <div className="relative z-10 bg-black">
          <AboutSlideshow />
          <FocusAreas />
          <Tours />
          <Impact />
          <FeaturedProjects />
        </div>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
