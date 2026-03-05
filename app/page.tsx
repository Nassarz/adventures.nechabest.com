'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSlideshow from '@/components/AboutSlideshow';
import FocusAreas from '@/components/FocusAreas';
import Tours from '@/components/Tours';
import Impact from '@/components/Impact';
import FeaturedProjects from '@/components/FeaturedProjects';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { motion, useScroll, useSpring } from 'motion/react';

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Handle hash links for smooth scroll
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#auth') {
        setIsAuthModalOpen(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          window.history.pushState(null, '', window.location.pathname);
        }} 
      />
    </main>
  );
}
