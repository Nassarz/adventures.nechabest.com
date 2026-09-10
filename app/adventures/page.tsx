'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Navigation, Wind, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useRouter } from 'next/navigation';
import { useSiteContent } from '@/hooks/useSiteContent';

interface Tour {
  id: string;
  title: string;
  name: string;
  location: string;
  price: number | string;
  rating?: number;
  reviews?: number;
  image: string;
  badge?: string;
  features?: Array<{ label: string; icon: any }>;
  tags?: string[];
  duration?: string;
  description?: string;
}

const FALLBACK_IMAGES = [
  'https://iili.io/3ovy0N9.jpg',
  'https://iili.io/F2JCsIf.jpg',
  'https://iili.io/fMclk92.jpg',
  'https://iili.io/fdCAigf.jpg',
  'https://iili.io/3oebjFS.jpg',
];

export default function AdventuresPage() {
  const router = useRouter();
  const { get } = useSiteContent('adventures');
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tours');
      if (!response.ok) throw new Error('Failed to fetch tours');
      const data = await response.json();
      setTours(data);
    } catch {
      setError('Failed to load adventures. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={get('adventures.hero.image', 'https://iili.io/fdClSYg.png')}
            alt="Adventures"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-nature/60" />
              <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px]">Adventures</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
              {get('adventures.hero.title', 'Uganda Adventures')}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl">
              {get('adventures.hero.subtitle', 'Gorilla trekking, wildlife safaris, mountain hikes, and cultural immersion — your Uganda adventure starts here.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tours Grid — identical card design to home page */}
      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Section Header */}
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
                <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
                  {get('adventures.grid.kicker', 'All Adventures')}
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight tracking-tighter">
                {get('adventures.grid.heading', 'Explore Uganda')}
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-foreground/60 max-w-md text-base md:text-lg leading-relaxed font-medium will-change-transform"
            >
              {get('adventures.grid.subtitle', 'From gorilla trekking to wildlife safaris, discover the best adventure experiences Uganda has to offer.')}
            </motion.p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-nature animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-foreground/60 text-lg">No adventures available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {tours.map((tour, i) => {
                const tourTitle = tour.title || tour.name || 'Untitled Adventure';
                const tourImage = tour.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
                const features = tour.features || [
                  { label: tour.duration || 'Multi-day', icon: Navigation },
                  { label: 'Guided', icon: MapPin },
                  { label: 'Premium Stay', icon: Wind }
                ];
                const tags = tour.tags || ['Adventure', 'Nature'];

                return (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => router.push(`/adventures/${tour.id}`)}
                    className="group bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-black/10 cursor-pointer will-change-transform"
                  >
                    <div className="block aspect-[1.1/1] relative overflow-hidden">
                      <Image
                        src={tourImage}
                        alt={tourTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                      {tour.badge && (
                        <div className="absolute top-6 left-6">
                          <span className="px-4 py-2 rounded-full bg-nature/10 backdrop-blur-xl text-nature text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-nature/20">
                            {tour.badge}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-6 right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:bg-nature hover:text-white transition-all border border-white/30"
                      >
                        <Heart className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>

                    <div className="p-8 md:p-10 space-y-6 md:space-y-8">
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight group-hover:text-nature transition-colors tracking-tight">
                            {tourTitle}
                          </h3>
                          {tour.rating && (
                            <div className="flex items-center gap-1 pt-1">
                              <Star className="w-3 h-3 md:w-4 md:h-4 text-nature fill-nature" />
                              <span className="font-bold text-primary text-xs md:text-sm">{tour.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-foreground/60 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-nature" />
                          {tour.location || 'Uganda'}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 md:py-6 border-y border-black/10">
                        {features.map((feature, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 text-center">
                            <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-nature" />
                            <span className="text-[8px] md:text-[9px] font-bold text-foreground/60 uppercase tracking-tighter">{feature.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-nature/10 text-nature text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-nature/20">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 md:pt-4 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] md:text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Starting from</span>
                          <span className="text-2xl md:text-3xl font-bold text-primary">
                            {typeof tour.price === 'number' ? `$${tour.price}` : tour.price || 'Contact'}
                          </span>
                        </div>
                        <motion.a
                          href={`/booking?tour=${tour.id}`}
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2.5 md:px-6 md:py-3.5 rounded-full bg-nature text-white font-bold text-xs md:text-sm shadow-lg hover:bg-primary transition-all flex items-center justify-center gap-1"
                        >
                          Book Now <Navigation className="w-3.5 h-3.5 rotate-45" />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
