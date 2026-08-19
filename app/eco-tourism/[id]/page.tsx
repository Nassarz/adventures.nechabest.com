'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  DollarSign,
  Heart,
  Share2,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { WhatsAppLogoIcon } from '@/components/FloatingWhatsApp';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  group?: string;
  category?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  itinerary?: ItineraryItem[];
  gallery?: string[];
}

export default function TourDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'gallery'>('overview');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (!id) return;
    const fetchTourDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tours/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Tour not found');
        }
        const data = await res.json();
        setTour(data);
      } catch (err) {
        console.error('Error fetching tour details:', err);
        setError('Could not find the requested package. It may have been removed or unpublished.');
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tour?.title || 'Nechabest Eco Tour',
        text: tour?.description?.substring(0, 100) || '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-nature animate-spin mx-auto" />
          <p className="text-white font-medium text-lg">Loading amazing tour details...</p>
        </div>
      </main>
    );
  }

  if (error || !tour) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <Navbar />
        <div className="max-w-md space-y-6">
          <Compass className="w-20 h-20 text-nature animate-pulse mx-auto" />
          <h2 className="text-3xl font-bold text-white">Tour Not Found</h2>
          <p className="text-white/60">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => router.push('/eco-tourism')}
            className="px-6 py-3 bg-nature text-white rounded-full font-bold hover:bg-white hover:text-nature transition-all"
          >
            Back to Eco-Tourism
          </button>
        </div>
      </main>
    );
  }

  const allImages = [tour.image, ...(tour.gallery || [])].filter(Boolean);

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-white selection:bg-nature selection:text-white pb-12">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />

        {/* Hero Banner Section */}
        <section className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden bg-black flex items-end">
          <div className="absolute inset-0">
            <Image
              src={tour.image}
              alt={tour.title}
              fill
              className="object-cover opacity-80 brightness-75 scale-105"
              priority
              unoptimized
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/55" />
          </div>

          {/* Floating Actions */}
          <div className="absolute top-28 left-6 md:left-12 z-20 flex gap-4">
            <button
              onClick={() => router.push('/eco-tourism')}
              className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all border border-white/20 shadow-lg"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-28 right-6 md:right-12 z-20 flex gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 backdrop-blur-md rounded-full border border-white/20 shadow-lg transition-all ${
                isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all border border-white/20 shadow-lg"
              title="Share Tour"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-12 w-full">
            <div className="max-w-3xl space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nature/80 backdrop-blur-md text-white border border-nature/30 text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {tour.category || 'Eco-Adventure'}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg leading-tight"
              >
                {tour.title}
              </motion.h1>

              {/* Quick Info Capsule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 text-white/95"
              >
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs md:text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-nature" />
                  {tour.location}
                </div>
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs md:text-sm font-semibold">
                  <Clock className="w-4 h-4 text-nature" />
                  {tour.duration}
                </div>
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs md:text-sm font-semibold">
                  <Users className="w-4 h-4 text-nature" />
                  {tour.group || 'Flexible Group'}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Details Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Tab Navigation */}
              <div className="flex border-b border-black/10 gap-6 overflow-x-auto pb-2">
                {(['overview', 'itinerary', 'gallery'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-lg font-bold pb-2 capitalize tracking-wide transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-nature border-nature font-extrabold'
                        : 'text-foreground/45 border-transparent hover:text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Display */}
              <div className="min-h-[400px]">
                {/* 1. Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                    {/* Description */}
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl font-bold text-primary">About this tour</h3>
                      <p className="text-foreground/70 text-lg leading-relaxed whitespace-pre-line font-medium">
                        {tour.description}
                      </p>
                    </div>

                    {/* Highlights Section */}
                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-nature" />
                          Tour Highlights
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tour.highlights.map((highlight, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-nature/20 hover:bg-slate-100/50 transition-all"
                            >
                              <div className="w-6 h-6 rounded-full bg-nature/10 flex items-center justify-center text-nature mt-0.5 flex-shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-foreground/80 font-semibold text-sm">{highlight}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inclusions and Exclusions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      {/* Includes */}
                      <div className="p-6 rounded-2xl bg-nature/5 border border-nature/15 space-y-4">
                        <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                          <Check className="w-5 h-5 text-nature" />
                          What&apos;s Included
                        </h4>
                        <ul className="space-y-3">
                          {tour.includes && tour.includes.length > 0 ? (
                            tour.includes.map((inc, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-foreground/75 text-sm font-semibold">
                                <span className="text-nature font-bold text-base mt-0.5">•</span>
                                {inc}
                              </li>
                            ))
                          ) : (
                            <li className="text-foreground/50 text-sm italic">Contact us for inclusions.</li>
                          )}
                        </ul>
                      </div>

                      {/* Excludes */}
                      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/15 space-y-4">
                        <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                          <X className="w-5 h-5 text-red-500" />
                          What&apos;s Excluded
                        </h4>
                        <ul className="space-y-3">
                          {tour.excludes && tour.excludes.length > 0 ? (
                            tour.excludes.map((exc, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-foreground/75 text-sm font-semibold">
                                <span className="text-red-500 font-bold text-base mt-0.5">•</span>
                                {exc}
                              </li>
                            ))
                          ) : (
                            <li className="text-foreground/50 text-sm italic">Personal items & tips.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. Itinerary Tab */}
                {activeTab === 'itinerary' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl font-bold text-primary">Day-by-Day Itinerary</h3>
                      <p className="text-foreground/60 text-sm">Expand each day to explore what experiences are lined up.</p>
                    </div>

                    {tour.itinerary && tour.itinerary.length > 0 ? (
                      <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 ml-2 pt-2">
                        {tour.itinerary
                          .sort((a, b) => a.day - b.day)
                          .map((dayPlan, index) => {
                            const isExpanded = !!expandedDays[dayPlan.day];
                            return (
                              <div key={dayPlan.day} className="relative group">
                                {/* Dot indicator */}
                                <div className={`absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                                  isExpanded ? 'bg-nature border-nature scale-110 shadow-md shadow-nature/20' : 'bg-white border-slate-300 group-hover:border-nature'
                                }`} />

                                {/* Card body */}
                                <div className="bg-slate-50 border border-slate-100 hover:border-black/5 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm">
                                  <button
                                    onClick={() => toggleDay(dayPlan.day)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                                        Day {dayPlan.day}
                                      </div>
                                      <h4 className="font-bold text-base md:text-lg text-primary group-hover:text-nature transition-colors">
                                        {dayPlan.title}
                                      </h4>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-foreground/40" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-foreground/40" />
                                    )}
                                  </button>

                                  <AnimatePresence initial={false}>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-foreground/75 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
                                          {dayPlan.description}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Compass className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                        <p className="text-foreground/50 text-sm font-semibold">Itinerary details are flexible and customized based on group setup. Contact us to design.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. Gallery Tab */}
                {activeTab === 'gallery' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl font-bold text-primary">Photos of the Journey</h3>
                      <p className="text-foreground/60 text-sm">Visual tour captures and landscape highlights.</p>
                    </div>

                    {allImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {allImages.map((image, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => setActiveImage(image)}
                            className="aspect-[4/3] relative rounded-2xl overflow-hidden cursor-zoom-in border border-black/5 shadow-sm bg-slate-100"
                          >
                            <Image
                              src={image}
                              alt={`${tour.title} Gallery Photo ${i + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <ImageIcon className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                        <p className="text-foreground/50 text-sm">No additional photos uploaded yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Booking CTA Column (Sticky) */}
            <div className="lg:col-span-1 lg:sticky lg:top-32 space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-6 md:space-y-8 shadow-xl"
              >
                <div className="space-y-2">
                  <span className="text-[10px] md:text-xs text-foreground/45 font-bold uppercase tracking-widest block">Investment package starting at</span>
                  <div className="flex items-baseline text-primary gap-1">
                    <DollarSign className="w-8 h-8 text-nature self-center -mr-1" />
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{tour.price}</span>
                    <span className="text-foreground/55 text-sm font-semibold">/ person</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-primary/10" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-foreground/80 text-sm font-semibold">
                    <Calendar className="w-4 h-4 text-nature flex-shrink-0" />
                    <span>Duration: {tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground/80 text-sm font-semibold">
                    <Users className="w-4 h-4 text-nature flex-shrink-0" />
                    <span>Group setup: {tour.group || 'Flexible Group Size'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground/80 text-sm font-semibold">
                    <MapPin className="w-4 h-4 text-nature flex-shrink-0" />
                    <span>Destination: {tour.location}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/booking?tour=${tour.id}`)}
                    className="w-full py-4 bg-nature text-white text-sm md:text-base font-bold rounded-2xl hover:bg-primary transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Compass className="w-5 h-5" />
                    Book This Adventure
                  </motion.button>

                  <motion.a
                    href={buildWhatsAppLink(
                      `Hello Nechabest Adventures! I would like to book the "${tour.title}" tour (${tour.duration}, ${tour.location}). Please share availability and payment details.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 bg-[#25D366] hover:bg-[#1fb959] text-white text-sm md:text-base font-bold rounded-2xl transition-all shadow-[0_10px_25px_rgba(37,211,102,0.35)] flex items-center justify-center gap-2"
                  >
                    <WhatsAppLogoIcon className="w-5 h-5" />
                    Book via WhatsApp
                  </motion.a>

                  <p className="text-[10px] text-center text-foreground/50 leading-relaxed font-medium">
                    * Booking takes 2 minutes. Confirmation details and safe payment options will be coordinated within 24 hours.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Lightbox / Fullscreen Image Viewer Modal */}
        <AnimatePresence>
          {activeImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 cursor-zoom-out"
            >
              <div className="relative w-full max-w-5xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={activeImage}
                  alt="Gallery Lightbox view"
                  fill
                  className="object-contain"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setActiveImage(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2.5 transition shadow"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
