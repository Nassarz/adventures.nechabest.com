'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Star, Navigation, Loader2, ArrowLeft, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location?: string;
  accommodation?: string;
  meals?: string;
}

interface TourDetail {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  gallery?: string[];
  price: string;
  priceNum?: number;
  duration: string;
  group?: string;
  rating: number;
  reviews?: number;
  highlights: string[];
  includes?: string[];
  excludes?: string[];
  itinerary?: ItineraryDay[];
  location?: string;
  category?: string;
}

export default function AdventureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tours/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setTour(data))
      .catch(() => setTour(null))
      .finally(() => setLoading(false));
  }, [id]);

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
          <p className="text-foreground/60 text-lg">Adventure not found.</p>
          <Link href="/adventures" className="text-nature font-bold hover:underline">Back to Adventures</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const tourTitle = tour.title || 'Untitled Adventure';

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src={tour.image || 'https://iili.io/3ovy0N9.jpg'} alt={tourTitle} fill className="object-cover" referrerPolicy="no-referrer" priority quality={85} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Link href="/adventures" className="inline-flex items-center gap-2 text-nature text-sm font-bold hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Adventures
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">{tourTitle}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              {tour.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-nature" /> {tour.location}</span>}
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-nature fill-nature" /> {tour.rating}</span>
              <span>{tour.duration}</span>
              {tour.group && <span>{tour.group}</span>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-primary">About This Adventure</h2>
              <p className="text-foreground/70 text-lg leading-relaxed">
                {tour.longDescription || tour.description}
              </p>
            </div>

            {tour.highlights && tour.highlights.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-primary">Highlights</h2>
                <ul className="space-y-3">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/70">
                      <Check className="w-5 h-5 text-nature shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tour.includes && tour.includes.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-primary">What&apos;s Included</h2>
                <ul className="space-y-3">
                  {tour.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/70">
                      <Check className="w-5 h-5 text-nature shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tour.excludes && tour.excludes.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-primary">What&apos;s Not Included</h2>
                <ul className="space-y-3">
                  {tour.excludes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/60">
                      <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-primary">Itinerary</h2>
                <div className="space-y-6">
                  {tour.itinerary.map((day, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 rounded-2xl bg-[#F8F9FA] border border-black/5 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-nature text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {day.day}
                        </span>
                        <h3 className="font-display text-xl font-bold text-primary">{day.title}</h3>
                      </div>
                      <p className="text-foreground/70 leading-relaxed">{day.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-foreground/50 font-bold uppercase tracking-wider">
                        {day.location && <span>📍 {day.location}</span>}
                        {day.accommodation && <span>🏨 {day.accommodation}</span>}
                        {day.meals && <span>🍽️ {day.meals}</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-8 rounded-[2rem] bg-[#F8F9FA] border border-black/5 space-y-6">
              <div>
                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Starting from</p>
                <p className="text-4xl font-bold text-primary">{tour.price}</p>
              </div>
              <div className="space-y-2 text-sm text-foreground/60">
                <p><span className="font-bold text-primary">Duration:</span> {tour.duration}</p>
                {tour.location && <p><span className="font-bold text-primary">Location:</span> {tour.location}</p>}
                {tour.group && <p><span className="font-bold text-primary">Group Size:</span> {tour.group}</p>}
                <p className="flex items-center gap-1"><span className="font-bold text-primary">Rating:</span> <Star className="w-4 h-4 text-nature fill-nature" /> {tour.rating}</p>
              </div>
              <motion.a
                href={`/booking?tour=${tour.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full text-center px-8 py-4 rounded-full bg-nature text-white font-bold text-sm shadow-lg hover:bg-primary transition-all"
              >
                Book Now
              </motion.a>
              <a
                href={`https://wa.me/256756310029?text=${encodeURIComponent(`Hi! I'm interested in the ${tourTitle} adventure.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-8 py-4 rounded-full border-2 border-nature text-nature font-bold text-sm hover:bg-nature hover:text-white transition-all"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
