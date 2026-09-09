'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Star, Navigation, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useRouter } from 'next/navigation';
import { useSiteContent } from '@/hooks/useSiteContent';

interface Tour {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
  highlights: string[];
  location?: string;
}

export default function EcoTourismPage() {
  const router = useRouter();
  const { get } = useSiteContent('eco-tourism');
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tours')
      .then((res) => res.json())
      .then((data) => setTours(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={get('eco.hero.image', 'https://iili.io/fdClSYg.png')} alt="Eco-Tourism" fill className="object-cover" referrerPolicy="no-referrer" unoptimized />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-nature/60" />
              <span className="text-nature font-bold uppercase tracking-[0.3em] text-[10px]">Eco-Tourism</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">{get('eco.hero.title', 'Eco-Tourism Adventures')}</h1>
            <p className="text-white/70 text-lg max-w-2xl">{get('eco.hero.subtitle', 'Sustainable tourism experiences that support conservation and local communities.')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-nature animate-spin" /></div>
          ) : tours.length === 0 ? (
            <div className="text-center py-20"><p className="text-foreground/60 text-lg">No tours available at the moment.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour, i) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => router.push(`/eco-tourism/${tour.id}`)}
                  className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-black/10 cursor-pointer"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image src={tour.image || 'https://picsum.photos/seed/tour/800/600'} alt={tour.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-1">
                      <Star className="w-4 h-4 text-nature fill-nature" />
                      <span className="text-white text-sm font-bold">{tour.rating}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-display text-xl font-bold text-primary group-hover:text-nature transition-colors">{tour.name}</h3>
                    <div className="flex items-center gap-2 text-foreground/60 text-xs font-bold uppercase tracking-widest">
                      <MapPin className="w-3 h-3 text-nature" />
                      {tour.location || 'Uganda'}
                    </div>
                    <p className="text-foreground/60 text-sm line-clamp-2">{tour.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-black/5">
                      <span className="text-2xl font-bold text-primary">${tour.price}</span>
                      <span className="text-xs text-foreground/40 font-bold">{tour.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
