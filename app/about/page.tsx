'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function AboutPage() {
  const { get } = useSiteContent('about');

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={get('about.hero.image', 'https://iili.io/fdC0KF9.jpg')}
            alt="About Nechabest Adventures"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-nature/60" />
              <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px]">About Us</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
              {get('about.hero.title', 'Our Story')}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl">
              {get('about.hero.subtitle', 'Nechabest Adventures is committed to sustainable tourism that benefits both travelers and local communities in Uganda.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              {get('about.mission.title', 'Our Mission')}
            </h2>
            <p className="text-foreground/70 text-lg leading-relaxed">
              {get('about.mission.text', 'To provide extraordinary eco-tourism experiences in Uganda while empowering local communities and protecting the natural environment for future generations.')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              {get('about.vision.title', 'Our Vision')}
            </h2>
            <p className="text-foreground/70 text-lg leading-relaxed">
              {get('about.vision.text', 'To be East Africa\'s leading eco-tourism operator, recognized for our commitment to conservation, community development, and delivering authentic, transformative travel experiences.')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8"
          >
            {[
              { title: 'Conservation', desc: 'Every tour directly supports wildlife conservation and habitat protection across Uganda.' },
              { title: 'Community', desc: 'We hire local guides, source from local businesses, and reinvest in community development.' },
              { title: 'Sustainability', desc: 'Our operations are designed to minimize environmental impact and maximize positive outcomes.' },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-[#F8F9FA] border border-black/5 space-y-4">
                <h3 className="font-display text-xl font-bold text-primary">{item.title}</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
