'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Star, MapPin, Navigation, Wind } from 'lucide-react';
import Image from 'next/image';

const tours = [
  {
    id: '1',
    title: 'Rwenzori Peaks Trek',
    location: 'Kasese, Uganda',
    price: 450,
    rating: 4.9,
    reviews: 124,
    image: 'https://picsum.photos/seed/mountain/800/600',
    badge: 'Adventure',
    features: [
      { label: '7 Days', icon: Navigation },
      { label: 'Guided', icon: MapPin },
      { label: 'Eco-Stay', icon: Wind }
    ],
    tags: ['Hiking', 'Wildlife', 'Photography']
  },
  {
    id: '2',
    title: 'Coffee Farm Heritage',
    location: 'Foothills, Rwenzori',
    price: 85,
    rating: 4.8,
    reviews: 86,
    image: 'https://picsum.photos/seed/coffee/800/600',
    badge: 'Cultural',
    features: [
      { label: 'Full Day', icon: Navigation },
      { label: 'Tasting', icon: MapPin },
      { label: 'Workshop', icon: Wind }
    ],
    tags: ['Organic', 'Community', 'Fair Trade']
  },
  {
    id: '3',
    title: 'WEF Nexus Field Tour',
    location: 'Mubuku Valley',
    price: 120,
    rating: 5.0,
    reviews: 42,
    image: 'https://picsum.photos/seed/water-tech/800/600',
    badge: 'Educational',
    features: [
      { label: '6 Hours', icon: Navigation },
      { label: 'Technical', icon: MapPin },
      { label: 'Impact', icon: Wind }
    ],
    tags: ['Water', 'Energy', 'Sustainability']
  }
];

export default function Tours() {
  return (
    <section id="tours" className="py-16 md:py-32 bg-[#000000] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 will-change-transform"
          >
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-nature/30" />
              <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Curated Experiences</span>
            </div>
            <h2 className="font-display text-4xl md:text-7xl font-bold text-white leading-tight tracking-tighter">
              Explore <span className="italic font-light text-nature">Uganda</span>
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/40 max-w-md text-base md:text-lg leading-relaxed font-medium will-change-transform"
          >
            Immerse yourself in the heart of sustainable development through our community-led tours and technical field visits.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {tours.map((tour, i) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group bg-[#020C08] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_80px_rgba(0,255,0,0.1)] transition-all duration-500 border border-white/5 will-change-transform"
            >
              {/* Image Header */}
              <div className="aspect-[1.1/1] relative overflow-hidden">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020C08] to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 rounded-full bg-nature/10 backdrop-blur-xl text-nature text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-nature/20">
                    {tour.badge}
                  </span>
                </div>
                
                <button className="absolute top-6 right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-nature hover:text-black transition-all border border-white/10">
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 md:p-10 space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-nature transition-colors tracking-tight">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-1 pt-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-nature fill-nature" />
                      <span className="font-bold text-white text-xs md:text-sm">{tour.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-nature" />
                    {tour.location}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 md:py-6 border-y border-white/5">
                  {tour.features.map((feature, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 text-center">
                      <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-nature/60" />
                      <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-tighter">{feature.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {tour.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-nature/5 text-nature/50 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-nature/10">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 md:pt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] text-white/20 font-bold uppercase tracking-widest">Starting from</span>
                    <span className="text-2xl md:text-3xl font-bold text-white">${tour.price}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-nature text-black font-bold text-xs md:text-sm shadow-[0_0_30px_rgba(0,255,0,0.2)] hover:bg-white transition-all flex items-center gap-2"
                  >
                    Book Now <Navigation className="w-3 h-3 md:w-4 md:h-4 rotate-45" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
