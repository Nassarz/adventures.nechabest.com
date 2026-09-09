'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Star, Clock, Users, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useRouter, useParams } from 'next/navigation';

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
  groupSize?: string;
}

export default function TourDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/tours`)
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((t: Tour) => t.id === params.id);
          setTour(found || null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-nature animate-spin" />
        </div>
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
          <p className="text-foreground/60 text-lg">Tour not found.</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-nature text-white rounded-full font-bold">Go Back</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src={tour.image || 'https://picsum.photos/seed/tour/1200/800'} alt={tour.name} fill className="object-cover" referrerPolicy="no-referrer" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-12 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to Tours
            </button>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">{tour.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-nature" /> {tour.location || 'Uganda'}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-nature" /> {tour.duration}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-nature fill-nature" /> {tour.rating}</span>
              {tour.groupSize && <span className="flex items-center gap-1"><Users className="w-4 h-4 text-nature" /> {tour.groupSize}</span>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <h2 className="font-display text-3xl font-bold text-primary">About This Tour</h2>
            <p className="text-foreground/70 text-lg leading-relaxed">{tour.description}</p>
          </motion.div>

          {tour.highlights.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-primary">Highlights</h2>
              <ul className="space-y-3">
                {tour.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/70">
                    <span className="w-2 h-2 rounded-full bg-nature mt-2 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 rounded-[2rem] bg-[#F8F9FA] border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Starting from</p>
              <p className="text-4xl font-bold text-primary">${tour.price}</p>
            </div>
            <a href={`/booking?tour=${tour.id}`} className="px-10 py-4 rounded-full bg-nature text-white font-bold text-lg hover:bg-primary transition-all shadow-lg">
              Book This Tour
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
