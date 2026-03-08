'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatedParticles } from '@/components/AnimatedParticles';
import { AnimatedSparkles } from '@/components/AnimatedSparkles';
import { motion, useScroll, useSpring, useTransform, useInView } from 'framer-motion';
import { Target, Eye, Leaf, Users, Lightbulb, Shield, ArrowRight, Heart, Mail, Sparkles, Droplet, Zap, Sprout, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const numValue = parseInt(value.replace(/\D/g, '')) || 0;

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = numValue;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, numValue]);

  return (
    <span ref={ref}>
      {isInView ? count : 0}{suffix}
    </span>
  );
}

const values = [
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'We are committed to sustainable solutions that balance environmental integrity with socio-economic growth, ensuring future generations inherit a thriving planet.',
    color: 'bg-nature'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We engage communities as equal partners, co-creating lasting and meaningful change through collaboration, respect, and shared ownership.',
    color: 'bg-primary'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We embrace innovative, science-backed approaches to address Africa\'s most pressing environmental and social challenges with cutting-edge solutions.',
    color: 'bg-secondary'
  },
  {
    icon: Shield,
    title: 'Transparency',
    description: 'We operate with honesty, openness, and integrity in all our activities, ensuring full accountability to our stakeholders and communities.',
    color: 'bg-[#4A635D]'
  }
];

const stats = [
  { number: '2018', label: 'Founded' },
  { number: '50+', label: 'Projects Completed' },
  { number: '15+', label: 'Partner Organizations' },
  { number: '10K+', label: 'Lives Impacted' }
];

export default function AboutPage() {
  const { get } = useSiteContent('about');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-white selection:bg-nature selection:text-white">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={get('about.hero.image', 'https://iili.io/fdC0KF9.jpg')}
              alt="African landscape"
              fill
              className="object-cover"
              priority
              unoptimized
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-primary/70 to-nature/80" />
            
            {/* Animated particles overlay */}
            <AnimatedParticles count={20} />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 md:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white shadow-2xl hover:bg-white/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.3em]">Our Story</span>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-[1.1] tracking-tight drop-shadow-2xl"
              >
                {get('about.hero.title', 'About Nechabest Sustainable Initiatives')}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg md:text-2xl text-white/95 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
              >
                {get('about.hero.subtitle', 'We combine science and social values to deliver effective solutions for the better management of water, energy, and environment across Africa.')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-4"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {stat.number.includes('+') ? (
                        <>
                          <AnimatedCounter value={stat.number} />+
                        </>
                      ) : (
                        stat.number
                      )}
                    </div>
                    <div className="text-xs md:text-sm text-white/70 font-semibold uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 md:py-32 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Our Direction</span>
              <h2 className="font-display text-4xl md:text-7xl font-bold text-primary">
                Mission <span className="text-nature">&</span> Vision
              </h2>
              <div className="w-24 h-1.5 bg-nature mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="relative p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-[#F8F9FA] to-white border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Background Image on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <Image
                      src="https://picsum.photos/seed/mission-bg/600/800"
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="50vw"
                    />
                  </div>

                  <div className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                    <Target className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-nature">Our Purpose</span>
                      <h3 className="font-display text-3xl md:text-5xl font-bold text-primary mt-2">Our Mission</h3>
                    </div>

                    <div className="w-16 h-1 bg-nature rounded-full" />

                    <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                      Our mission is to foster sustainable development across Africa by implementing community-driven solutions that enhance environmental conservation and improve livelihoods. We provide technical expertise, capacity building, and innovative tools that empower communities to thrive while protecting natural resources for generations to come.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="px-4 py-2 rounded-full bg-nature/10 text-nature text-xs font-bold border border-nature/20">Community-Driven</span>
                      <span className="px-4 py-2 rounded-full bg-nature/10 text-nature text-xs font-bold border border-nature/20">Technical Excellence</span>
                      <span className="px-4 py-2 rounded-full bg-nature/10 text-nature text-xs font-bold border border-nature/20">Lasting Impact</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="relative p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-nature/5 to-white border border-nature/20 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Background Image on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <Image
                      src="https://picsum.photos/seed/vision-bg/600/800"
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="50vw"
                    />
                  </div>

                  <div className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-nature/10 flex items-center justify-center group-hover:bg-nature group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                    <Eye className="w-8 h-8 text-nature group-hover:text-white transition-colors" />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Aspiration</span>
                      <h3 className="font-display text-3xl md:text-5xl font-bold text-primary mt-2">Our Vision</h3>
                    </div>

                    <div className="w-16 h-1 bg-primary rounded-full" />

                    <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                      To be recognized as leaders of an equitable global future where communities thrive in harmony with nature. We strive for a world where every generation can access clean water, renewable energy, and sustainable food security—a future where environmental stewardship and human prosperity go hand in hand.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">Global Leadership</span>
                      <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">Harmony with Nature</span>
                      <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">Generational Impact</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 md:py-32 bg-[#F8F9FA] relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -30, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-20 right-10 w-32 h-32 rounded-full bg-nature/5 blur-3xl"
            />
            <motion.div
              animate={{ 
                y: [0, 30, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-40 left-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">What Drives Us</span>
              <h2 className="font-display text-4xl md:text-7xl font-bold text-primary">
                Our Core <span className="italic font-light text-nature">Values</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto">
                The principles that guide every decision we make and every action we take
              </p>
              <div className="w-24 h-1.5 bg-nature mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {values.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.6, 
                    delay: i * 0.1,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="group"
                >
                  <div className="relative h-full p-8 md:p-10 rounded-[2.5rem] bg-white border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${value.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0`}>
                        <value.icon className="w-8 h-8 md:w-10 md:h-10" />
                      </div>

                      <div className="space-y-4 flex-1">
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-primary group-hover:text-nature transition-colors">
                          {value.title}
                        </h3>
                        <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
                      <div className="absolute bottom-0 right-0 w-full h-full rounded-tl-[100%] bg-gradient-to-tl from-primary to-nature" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Image Gallery / Story Section */}
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Our Journey</span>
                <h2 className="font-display text-4xl md:text-6xl font-bold text-primary leading-tight">
                  Building a <span className="text-nature italic">Sustainable</span> Africa
                </h2>
                <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                  Since our founding, we&apos;ve worked alongside communities across Africa to implement innovative solutions that balance environmental conservation with economic development. Our approach is rooted in scientific research, local knowledge, and collaborative partnerships.
                </p>
                <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                  From the Rwenzori Mountains to the shores of Lake Victoria, we&apos;re creating lasting change through clean water access, renewable energy systems, climate-smart agriculture, and eco-tourism initiatives that benefit both people and nature.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-full"
              >
                <div className="relative w-full h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
                  <Image
                    src="https://picsum.photos/seed/about-nechabest/800/1000"
                    alt="Nechabest team in the field"
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                </div>

                {/* Floating stat card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="absolute -bottom-8 -left-8 md:-left-12 p-6 md:p-8 bg-white rounded-3xl shadow-2xl border border-black/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-nature flex items-center justify-center text-white">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">100%</div>
                      <div className="text-sm text-foreground/60 font-semibold">Community Focused</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Impact Gallery Section - NEW COOL SECTION */}
        <section className="py-16 md:py-32 bg-gradient-to-b from-white to-[#F8F9FA] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Our Impact</span>
              <h2 className="font-display text-4xl md:text-7xl font-bold text-primary">
                Transforming <span className="italic font-light text-nature">Communities</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto">
                Real stories, real change across Africa&apos;s diverse landscapes
              </p>
              <div className="w-24 h-1.5 bg-nature mx-auto rounded-full" />
            </motion.div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Large feature image */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
                className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] h-[400px] md:h-full min-h-[500px]"
              >
                <Image
                  src="https://picsum.photos/seed/community-impact/1200/800"
                  alt="Community initiatives"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-2xl md:text-4xl font-bold mb-3"
                  >
                    Clean Water Access
                  </motion.h3>
                  <p className="text-white/90 text-sm md:text-base">Providing sustainable water solutions to rural communities</p>
                </div>
              </motion.div>

              {/* Smaller images */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="group relative overflow-hidden rounded-[2rem] h-[300px] md:h-[240px]"
              >
                <Image
                  src="https://picsum.photos/seed/renewable-energy/600/400"
                  alt="Renewable energy projects"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nature/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h4 className="font-bold text-lg md:text-xl mb-2">Solar Energy</h4>
                  <p className="text-white/90 text-xs md:text-sm">Off-grid power solutions</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="group relative overflow-hidden rounded-[2rem] h-[300px] md:h-[240px]"
              >
                <Image
                  src="https://picsum.photos/seed/agriculture/600/400"
                  alt="Sustainable agriculture"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h4 className="font-bold text-lg md:text-xl mb-2">Eco-Agriculture</h4>
                  <p className="text-white/90 text-xs md:text-sm">Climate-smart farming</p>
                </div>
              </motion.div>
            </div>

            {/* Stats Row with Icons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 md:mt-16"
            >
              {[
                { icon: Droplet, value: '25+', label: 'Water Projects', color: 'bg-blue-500' },
                { icon: Zap, value: '15+', label: 'Energy Systems', color: 'bg-yellow-500' },
                { icon: Sprout, value: '40+', label: 'Farms Supported', color: 'bg-green-500' },
                { icon: MapPin, value: '8', label: 'Districts Covered', color: 'bg-primary' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="text-center p-6 md:p-8 rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <stat.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-foreground/60 font-semibold uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team/Partnership Showcase - NEW SECTION */}
        <section className="py-16 md:py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Together We Thrive</span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-primary">
                Our <span className="italic font-light text-nature">Collaborative</span> Approach
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Partnership Card 1 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="group relative"
              >
                <div className="relative h-[350px] rounded-[2.5rem] overflow-hidden">
                  <Image
                    src="https://picsum.photos/seed/partnerships/700/450"
                    alt="Partnership programs"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                      Local Partnerships
                    </h3>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4">
                      Working hand-in-hand with local communities, NGOs, and government bodies to create sustainable solutions.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">Community-Led</span>
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">Inclusive</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Partnership Card 2 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="group relative"
              >
                <div className="relative h-[350px] rounded-[2.5rem] overflow-hidden">
                  <Image
                    src="https://picsum.photos/seed/global-network/700/450"
                    alt="Global network"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nature/90 via-nature/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                      Global Network
                    </h3>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4">
                      Connecting with international organizations and experts to bring world-class solutions to Africa.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">Expert-Driven</span>
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">Innovative</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-[#2D5A43] to-nature relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl"
            />
            <motion.div
              animate={{ 
                rotate: [360, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{ 
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl"
            />
          </div>

          {/* Floating Sparkles */}
          <AnimatedSparkles count={5} />

          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <h2 className="font-display text-4xl md:text-7xl font-bold text-white leading-tight">
                Join Our <span className="italic font-light">Mission</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Your support can make a lasting difference. Partner with us to create a sustainable future for Africa&apos;s communities and the environment.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 rounded-full bg-white text-primary font-bold text-lg shadow-2xl hover:bg-nature hover:text-white transition-all flex items-center gap-3"
                >
                  Get Involved <ArrowRight className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 rounded-full bg-white/10 backdrop-blur-md text-white border-2 border-white/30 font-bold text-lg hover:bg-white hover:text-primary transition-all flex items-center gap-3"
                >
                  <Mail className="w-5 h-5" /> Contact Us
                </motion.a>
              </div>

              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/50" />
                  <span>Volunteer Opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/50" />
                  <span>Partnership Programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/50" />
                  <span>Donation Options</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
