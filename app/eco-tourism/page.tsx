'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatedParticles } from '@/components/AnimatedParticles';
import { AnimatedSparkles } from '@/components/AnimatedSparkles';
import { motion, useScroll, useSpring } from 'framer-motion';
import { MapPin, Calendar, Users, Leaf, Heart, Star, TrendingUp, Award, Droplets, Trees, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/useSiteContent';
import HeroSlideshow from '@/components/HeroSlideshow';
import { useRouter } from 'next/navigation';


interface Tour {
  id: string;
  title: string;
  location: string;
  duration?: string;
  group?: string;
  price: string | number;
  image: string;
  highlights?: string[];
  rating?: number;
  reviews?: number;
}

const benefits = [
  {
    icon: Leaf,
    title: 'Environmental Impact',
    description: '100% of profits go to conservation and reforestation projects across Africa.'
  },
  {
    icon: Users,
    title: 'Community Benefit',
    description: 'Direct employment and income for 500+ local guide and hospitality staff.'
  },
  {
    icon: Award,
    title: 'Certified Sustainable',
    description: 'Certified by Global Sustainable Tourism Council for excellence.'
  },
  {
    icon: Droplets,
    title: 'Water Conservation',
    description: 'Solar-powered camps with zero-waste water management systems.'
  },
  {
    icon: Trees,
    title: 'Carbon Neutral',
    description: 'All tours are carbon-neutral through renewable energy usage.'
  },
  {
    icon: TrendingUp,
    title: 'Economic Growth',
    description: '$2M+ reinvested annually in local communities and conservation.'
  }
];

export default function EcoTourismPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [toursError, setToursError] = useState('');
  const { get } = useSiteContent('eco-tourism');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchEcoTours = async () => {
      try {
        setLoadingTours(true);
        const response = await fetch('/api/tours', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch eco tours');
        }
        const data = (await response.json()) as Tour[];
        setTours(data);
      } catch (error) {
        console.error('Error fetching eco tours:', error);
        setToursError('Unable to load tours right now. Please try again shortly.');
      } finally {
        setLoadingTours(false);
      }
    };

    fetchEcoTours();
  }, []);

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-white selection:bg-nature selection:text-white">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-24">
          {/* Background Slideshow */}
          <HeroSlideshow
            images={[
              get('eco.hero.image', 'https://iili.io/3ovy0N9.jpg'),
              get('eco.hero.image2', 'https://iili.io/F2JCsIf.jpg'),
            ]}
            overlay="bg-gradient-to-br from-black/70 via-primary/60 to-nature/70"
          >
            <AnimatedParticles count={25} />
          </HeroSlideshow>

          <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 md:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white shadow-2xl hover:bg-white/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.3em]">Sustainable Adventures</span>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3rem] text-white font-bold leading-[1.1] tracking-tight drop-shadow-2xl"
              >
                {get('eco.hero.title', 'Nechabest Sustainable Adventures')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-base md:text-lg text-white/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
              >
                {get('eco.hero.subtitle', "Explore Africa's natural wonders while supporting conservation. Every journey creates lasting impact for communities and the environment.")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              >
                <motion.a
                  href="#tours"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-full bg-nature text-white font-bold text-sm shadow-2xl hover:bg-white hover:text-nature transition-all flex items-center justify-center gap-2"
                >
                  Explore Tours <MapPin className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="#benefits"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md text-white border-2 border-white/30 font-bold text-sm hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  Learn More <Leaf className="w-4 h-4" />
                </motion.a>
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Impact Statistics */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-primary to-nature relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { number: '5000+', label: 'Happy Travelers' },
                { number: '50K+', label: 'Acres Protected' },
                { number: '97%', label: 'Sustainability Rating' },
                { number: '24/7', label: 'Customer Support' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center text-white"
                >
                  <div className="text-3xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-sm md:text-base font-semibold opacity-90">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Eco-Tourism Packages */}
        <section id="tours" className="py-16 md:py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Our Offerings</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">
                Eco-Tourism <span className="italic font-light text-nature">Packages</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto">
                Carefully curated experiences that connect you with nature while supporting conservation
              </p>
              <div className="w-24 h-1.5 bg-nature mx-auto rounded-full" />
            </motion.div>

            {loadingTours ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-nature" />
              </div>
            ) : toursError ? (
              <div className="text-center py-16 text-red-600 font-semibold">{toursError}</div>
            ) : tours.length === 0 ? (
              <div className="text-center py-16 text-foreground/70 font-semibold">No eco tours available right now.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {tours.map((tour, i) => (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                  <div 
                    onClick={() => router.push(`/eco-tourism/${tour.id}`)}
                    className="relative h-full rounded-[2.5rem] overflow-hidden bg-white border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="block relative h-48 md:h-56 overflow-hidden">
                      <Image
                        src={tour.image}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                      
                      {/* Badge */}
                      {typeof tour.rating === 'number' && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-primary text-sm">{tour.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 space-y-4">
                      <div>
                        <div className="block">
                          <h3 className="font-display text-2xl font-bold text-primary mb-2 group-hover:text-nature transition-colors">
                            {tour.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/70 mb-4">
                          <MapPin className="w-4 h-4 text-nature" />
                          <span className="font-semibold">{tour.location}</span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                          <div className="text-xs font-bold text-foreground">{tour.duration || 'Flexible'}</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-nature/5 border border-nature/10">
                          <Users className="w-5 h-5 text-nature mx-auto mb-1" />
                          <div className="text-xs font-bold text-foreground">{tour.group || 'Small groups'}</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-secondary/5 border border-secondary/10">
                          <Heart className="w-5 h-5 text-secondary mx-auto mb-1" />
                          <div className="text-xs font-bold text-foreground">{tour.reviews || 0}</div>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2">
                        {(tour.highlights && tour.highlights.length > 0 ? tour.highlights : ['Nature', 'Community', 'Sustainable']).map((highlight) => (
                          <span key={highlight} className="px-3 py-1 rounded-full bg-nature/10 text-nature text-xs font-bold border border-nature/20">
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-black/5 gap-2">
                        <div>
                          <div className="text-xs text-foreground/60 font-semibold">Starting from</div>
                          <div className="text-3xl font-bold text-primary">
                            {typeof tour.price === 'number' ? `$${tour.price}` : tour.price}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.a
                            href={`/booking?tour=${tour.id}`}
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2.5 rounded-full bg-nature text-white font-bold text-xs hover:bg-primary transition-all shadow-md flex items-center justify-center"
                          >
                            Book Now
                          </motion.a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-16 md:py-32 bg-gradient-to-b from-[#F8F9FA] to-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Why Choose Us</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">
                Conservation <span className="italic font-light text-nature">Impact</span>
              </h2>
              <div className="w-24 h-1.5 bg-nature mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="group p-8 md:p-10 rounded-[2.5rem] bg-white border border-black/5 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-nature/10 flex items-center justify-center mb-6 group-hover:bg-nature group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <benefit.icon className="w-8 h-8 text-nature group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-primary mb-3 group-hover:text-nature transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-lg text-foreground/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Guest Stories</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">
                What Travelers <span className="italic font-light text-nature">Say</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Conservation Volunteer',
                  text: 'An incredible experience! The guides were knowledgeable, the camps sustainable, and knowing my contribution supports conservation made it truly meaningful.',
                  image: 'https://iili.io/fdC0KF9.jpg'
                },
                {
                  name: 'Michael Chen',
                  role: 'Adventure Photographer',
                  text: 'Best eco-tourism experience I\'ve had. The balance between comfort and sustainability was perfect, and the wildlife photography opportunities were amazing.',
                  image: 'https://iili.io/3ovy0N9.jpg'
                },
                {
                  name: 'Emma Thompson',
                  role: 'Environmental Educator',
                  text: 'The framework we learned here was revolutionary. It showed me how tourism can genuinely benefit communities and ecosystems simultaneously.',
                  image: 'https://iili.io/F2JCsIf.jpg'
                }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-white to-primary/5 border border-black/5 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-lg text-foreground/70 mb-6 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="50px"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-primary">{testimonial.name}</div>
                      <div className="text-sm text-foreground/60">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-[#2D5A43] to-nature relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl"
            />
            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl"
            />
          </div>

          <AnimatedSparkles count={5} />

          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                Ready for Your <span className="italic font-light">Adventure?</span>
              </h2>
              <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                Join thousands of travelers making a positive impact. Book your eco-tourism experience today and help us protect Africa&apos;s natural heritage.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <motion.a
                  href="#tours"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-full bg-white text-primary font-bold text-sm shadow-2xl hover:bg-nature hover:text-white transition-all flex items-center gap-3"
                >
                  Browse Tours <MapPin className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md text-white border-2 border-white/30 font-bold text-sm hover:bg-white hover:text-primary transition-all flex items-center gap-3"
                >
                  Get in Touch
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
