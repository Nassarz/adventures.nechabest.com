'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Zap, Sprout, Heart } from 'lucide-react';

import Image from 'next/image';
import { useSiteContent } from '@/hooks/useSiteContent';

const areas = [
  {
    title: 'Water-Energy-Food (WEF) Nexus',
    desc: 'Clean water access, renewable energy solutions, and climate-smart agriculture for sustainable livelihoods.',
    icon: Droplets,
    image: 'https://picsum.photos/seed/water/600/400'
  },
  {
    title: 'Environmental Conservation',
    desc: 'Tree planting initiatives, watershed protection, and ecosystem restoration for a resilient future.',
    icon: Zap,
    image: 'https://picsum.photos/seed/energy/600/400'
  },
  {
    title: 'Green Livelihoods & Innovation',
    desc: 'Consultancy services, youth empowerment programs, and sustainable enterprise development.',
    icon: Sprout,
    image: 'https://picsum.photos/seed/farming/600/400'
  },
  {
    title: 'Community Health & Well-being',
    desc: 'Improving health outcomes through clean energy and sustainable food systems.',
    icon: Heart,
    image: 'https://picsum.photos/seed/health/600/400'
  }
];

export default function FocusAreas() {
  const { get } = useSiteContent('home');

  const dynamicAreas = [
    {
      ...areas[0],
      title: get('home.focus.area1.title', areas[0].title),
      desc: get('home.focus.area1.desc', areas[0].desc),
      image: get('home.focus.area1.image', areas[0].image),
    },
    {
      ...areas[1],
      title: get('home.focus.area2.title', areas[1].title),
      desc: get('home.focus.area2.desc', areas[1].desc),
      image: get('home.focus.area2.image', areas[1].image),
    },
    {
      ...areas[2],
      title: get('home.focus.area3.title', areas[2].title),
      desc: get('home.focus.area3.desc', areas[2].desc),
      image: get('home.focus.area3.image', areas[2].image),
    },
    {
      ...areas[3],
      title: get('home.focus.area4.title', areas[3].title),
      desc: get('home.focus.area4.desc', areas[3].desc),
      image: get('home.focus.area4.image', areas[3].image),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary">{get('home.focus.heading', 'Our Core Focus Areas')}</h2>
          <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg">
            {get('home.focus.subtitle', 'Three Pillars of Sustainable Development driving our mission in Uganda.')}
          </p>
          <div className="w-20 md:w-24 h-1 md:h-1.5 bg-nature mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {dynamicAreas.map((area, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5, 
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="group bg-white rounded-[2rem] md:rounded-3xl overflow-hidden border border-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 will-change-transform"
            >
              <div className="aspect-[1/1] md:aspect-[4/5] relative overflow-hidden">
                <Image 
                  src={area.image} 
                  alt={area.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <button className="w-full py-3 bg-white text-primary font-bold rounded-xl text-sm hover:bg-nature hover:text-white transition-colors">
                    {get('home.focus.learnMoreLabel', 'Learn More')}
                  </button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-3 md:space-y-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center text-primary group-hover:bg-nature group-hover:text-white transition-all duration-500">
                  <area.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-bold text-primary">
                  {area.title}
                </h3>
                <p className="text-foreground/60 text-xs md:text-sm leading-relaxed">
                  {area.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
