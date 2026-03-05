'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { ExternalLink, Calendar, ArrowRight } from 'lucide-react';

const projects = [
  {
    title: 'Solar-Powered Water Pumping',
    category: 'WEF Nexus',
    year: 2024,
    image: 'https://picsum.photos/seed/solar-water/1200/800',
    desc: 'Implementing renewable energy solutions to provide clean water access to remote communities in Kasese. Our system integrates IoT monitoring for real-time flow data.',
    featured: true
  },
  {
    title: 'Watershed Management',
    category: 'Conservation',
    year: 2023,
    image: 'https://picsum.photos/seed/watershed/800/600',
    desc: 'Protecting vital water sources through collaborative ecosystem restoration.',
    featured: false
  },
  {
    title: 'Climate-Smart Farming',
    category: 'Agriculture',
    year: 2024,
    image: 'https://picsum.photos/seed/smart-farm/800/600',
    desc: 'Training local farmers in resilient agricultural practices.',
    featured: false
  }
];

const research = [
  {
    title: 'Impact of Micro-Irrigation on Smallholder Yields',
    author: 'Dr. Sarah Namubiru',
    date: 'Jan 2024',
    tags: ['Irrigation', 'Economics']
  },
  {
    title: 'Biodiversity Trends in the Rwenzori Foothills',
    author: 'John Okello',
    date: 'Nov 2023',
    tags: ['Ecology', 'GIS']
  }
];

export default function FeaturedProjects() {
  return (
    <section id="blog" className="py-16 md:py-32 bg-[#fdfdfb] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 md:w-12 h-[1px] bg-primary/30" />
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Innovation & Research</span>
            </div>
            <h2 className="font-display text-4xl md:text-7xl font-bold text-primary leading-tight">
              Featured <span className="italic font-light text-secondary">Projects</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Featured Project */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-8 group relative aspect-[1/1] md:aspect-auto md:h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-primary/5 will-change-transform"
          >
            <Image
              src={projects[0].image}
              alt={projects[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            
            <div className="absolute top-6 left-6 md:top-8 md:left-8">
              <span className="px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Featured Case Study
              </span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4 text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-nature/50 rounded-md text-white">{projects[0].category}</span>
                <span>•</span>
                <span>{projects[0].year}</span>
              </div>
              <h3 className="font-display text-2xl md:text-5xl font-bold text-white max-w-2xl">
                {projects[0].title}
              </h3>
              <p className="text-white/70 text-sm md:text-lg max-w-xl line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                {projects[0].desc}
              </p>
              <div className="pt-2 md:pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <button className="flex items-center gap-2 text-white font-bold border-b-2 border-white/30 hover:border-white transition-all pb-1 text-sm md:text-base">
                  Read Full Report <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Secondary Projects Column */}
          <div className="md:col-span-4 flex flex-col gap-6 md:gap-8">
            {projects.slice(1).map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex-1 group relative aspect-[16/10] md:aspect-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl border border-primary/5 will-change-transform"
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/60 transition-colors" />
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end space-y-1 md:space-y-2">
                  <span className="text-white/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{project.category}</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">{project.title}</h3>
                  <button className="text-white/0 group-hover:text-white/100 transition-all text-xs md:text-sm font-bold flex items-center gap-2 pt-1 md:pt-2">
                    View Project <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Research Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-12 mt-4 md:mt-8 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-accent/20 border border-primary/5 relative overflow-hidden will-change-transform"
          >
            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-primary/10 text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                  Academic Contributions
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-primary">Latest Research & Publications</h3>
                <p className="text-primary/60 text-sm md:text-base leading-relaxed">
                  Our team actively contributes to the global knowledge base on sustainable development, WEF nexus, and climate adaptation.
                </p>
                <button className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all text-sm md:text-base">
                  Browse Publication Library <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {research.map((item, i) => (
                  <div 
                    key={i}
                    className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white/50 backdrop-blur-md border border-white/50 hover:bg-white transition-all group cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="flex gap-2">
                        {item.tags.map((tag, j) => (
                          <span key={j} className="text-[8px] md:text-[9px] font-bold uppercase tracking-tighter text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[9px] md:text-[10px] font-bold text-primary/40">{item.date}</span>
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 group-hover:text-nature transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-primary/5">
                      <span className="text-xs md:text-sm italic text-primary/60">by {item.author}</span>
                      <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-primary/20 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Explore All Work Button at Bottom */}
          <div className="md:col-span-12 flex justify-center mt-8 md:mt-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 md:px-12 md:py-5 rounded-full bg-primary text-white font-bold flex items-center gap-3 md:gap-4 hover:bg-nature transition-all shadow-2xl shadow-primary/20 text-base md:text-lg"
            >
              Explore All Work 
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
