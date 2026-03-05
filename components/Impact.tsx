'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { TreePine, Zap, Users, Handshake } from 'lucide-react';

const stats = [
  { label: 'Trees Planted', value: '10,000+', icon: TreePine, color: 'bg-nature' },
  { label: 'Households Powered', value: '1,500+', icon: Zap, color: 'bg-primary' },
  { label: 'Farmers Trained', value: '2,000+', icon: Users, color: 'bg-[#2D4A43]' },
  { label: 'Strategic Partners', value: '15+', icon: Handshake, color: 'bg-[#4A635D]' },
];

export default function Impact() {
  return (
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 md:space-y-8 will-change-transform"
          >
            <div className="space-y-3 md:space-y-4">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs block"
              >
                Our Measurable Impact
              </motion.span>
              <h2 className="font-display text-4xl md:text-8xl font-bold text-primary leading-[1] md:leading-[0.9]">
                Driving Change <br />
                <span className="text-nature italic font-light">Across Uganda</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground/60 leading-relaxed max-w-lg pt-2 md:pt-4">
                We believe in transparency and results. Every initiative we launch is tracked, measured, and optimized for maximum community benefit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-2 md:pt-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: i * 0.05 + 0.3,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-[#F8F9FA] border border-black/5 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group will-change-transform"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${stat.color} flex items-center justify-center mb-4 md:mb-6 text-white shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                    <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-3xl md:text-4xl font-bold text-primary tracking-tighter">{stat.value}</span>
                    <span className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/40">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-12 lg:mt-0 will-change-transform"
          >
            <div className="relative aspect-[1/1] md:aspect-[4/5] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl group">
              <Image 
                src="https://picsum.photos/seed/impact-uganda/1000/1250" 
                alt="Impact in action" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
            </div>
            
            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 1, 
                delay: 1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="absolute -bottom-6 -left-4 md:-bottom-10 md:-left-10 p-6 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] max-w-[280px] md:max-w-sm border border-black/5"
            >
              <p className="text-primary font-bold text-lg md:text-xl leading-snug italic">
                &quot;Sustainability is not just a goal, it&apos;s our way of life. We are building a legacy for the next generation.&quot;
              </p>
              <div className="mt-6 md:mt-8 flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-nature/10 flex items-center justify-center">
                  <TreePine className="w-5 h-5 md:w-6 md:h-6 text-nature" />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-0.5 md:mb-1">Project Director</p>
                  <p className="text-xs md:text-sm text-foreground/60">Nechabest Initiatives</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
