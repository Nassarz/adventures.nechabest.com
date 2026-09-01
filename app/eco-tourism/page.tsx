'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatedParticles } from '@/components/AnimatedParticles';
import { AnimatedSparkles } from '@/components/AnimatedSparkles';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Users, Leaf, Heart, Star, TrendingUp, Award, 
  Droplets, Trees, Sparkles, Loader2, ArrowRight, ExternalLink, 
  Compass, ShieldCheck, CheckCircle2, Search, SlidersHorizontal, X, Info 
} from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/useSiteContent';
import HeroSlideshow from '@/components/HeroSlideshow';

interface Tour {
  id: string;
  title: string;
  location: string;
  duration?: string;
  group?: string;
  price: string | number;
  image: string;
  highlights?: string[];
  category?: string;
  rating?: number;
  reviews?: number;
  description?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Adventures' },
  { id: 'safari', label: 'Savannah Safaris' },
  { id: 'trekking', label: 'Gorilla & Primate Treks' },
  { id: 'culture', label: 'Community & Culture' },
  { id: 'water', label: 'Lakes & Wilderness' },
];

const DEFAULT_TOURS: Tour[] = [
  {
    id: 'bwindi-gorilla-safari',
    title: 'Bwindis Impenetrable Gorilla Trekking',
    location: 'Bwindis National Park, Uganda',
    duration: '3 Days / 2 Nights',
    group: 'Small (Max 8)',
    price: 1250,
    image: 'https://iili.io/3ovy0N9.jpg',
    category: 'trekking',
    highlights: ['Gorilla Permit Included', 'Local Batwa Guide', 'Eco-Lodge Stay'],
    rating: 4.9,
    reviews: 128,
    description: 'Immerse yourself in ancient rainforests with certified local trackers to encounter endangered mountain gorillas in their natural habitat.'
  },
  {
    id: 'murchison-falls-expedition',
    title: 'Murchison Falls Eco-Safari & Nile Cruise',
    location: 'Murchison Falls, Uganda',
    duration: '4 Days / 3 Nights',
    group: 'Group (Max 12)',
    price: 890,
    image: 'https://iili.io/F2JCsIf.jpg',
    category: 'safari',
    highlights: ['Solar River Boat', 'Big Five Game Drive', 'Tree Planting'],
    rating: 4.8,
    reviews: 94,
    description: 'Witness the world’s most powerful waterfall while exploring game reserves supported by 100% solar-powered river cruises.'
  },
  {
    id: 'queen-elizabeth-wilderness',
    title: 'Queen Elizabeth Savanna & Chimpanzee Tracking',
    location: 'Kasese, Uganda',
    duration: '5 Days / 4 Nights',
    group: 'Small (Max 6)',
    price: 1100,
    image: 'https://iili.io/fdC0KF9.jpg',
    category: 'safari',
    highlights: ['Kazinga Channel Boat', 'Tree-Climbing Lions', 'Kyambura Chimp Trek'],
    rating: 4.9,
    reviews: 86,
    description: 'Spot tree-climbing lions and track chimpanzees in Kyambura Gorge while contributing to local wildlife corridor restoration.'
  },
  {
    id: 'rwenzori-mountain-trek',
    title: 'Rwenzori Mountains Climate Science Trek',
    location: 'Kasese, Rwenzori Range',
    duration: '6 Days / 5 Nights',
    group: 'Small (Max 6)',
    price: 1450,
    image: 'https://iili.io/fdClSYg.png',
    category: 'trekking',
    highlights: ['Glacial Research Site', 'Alpine Flora', 'Zero-Trace Camping'],
    rating: 5.0,
    reviews: 42,
    description: 'Hike Africa’s legendary Mountains of the Moon accompanied by climate researchers documenting glacial changes.'
  },
  {
    id: 'lake-bunyonyi-community',
    title: 'Lake Bunyonyi Eco-Resort & Island Culture',
    location: 'Kabale, Uganda',
    duration: '3 Days / 2 Nights',
    group: 'Flexible',
    price: 650,
    image: 'https://iili.io/3ovy0N9.jpg',
    category: 'culture',
    highlights: ['Canoeing', 'Island School Visit', 'Organic Farming Workshop'],
    rating: 4.8,
    reviews: 67,
    description: 'Unwind at Africa’s second deepest lake while participating in community-led organic agriculture and clean water projects.'
  },
  {
    id: 'ssese-islands-sanctuary',
    title: 'Ssese Islands Lake Victoria Primate Sanctuary',
    location: 'Kalangala, Lake Victoria',
    duration: '3 Days / 2 Nights',
    group: 'Small (Max 10)',
    price: 580,
    image: 'https://iili.io/F2JCsIf.jpg',
    category: 'water',
    highlights: ['Forest Walks', 'Fishing Community', 'Solar Island Resort'],
    rating: 4.7,
    reviews: 53,
    description: 'Discover untouched tropical island biodiversity on Lake Victoria with zero-emission solar boating and forest sanctuary tours.'
  }
];

const IMPACT_PILLARS = [
  {
    icon: Leaf,
    title: '100% Proceeds to Conservation',
    description: 'Every tour directly funds tree planting, wildlife rangers, and habitat restoration across East Africa.'
  },
  {
    icon: Users,
    title: 'Community Empowerment',
    description: 'Direct employment for 500+ local guides, hospitality team members, and women’s craft cooperatives.'
  },
  {
    icon: Award,
    title: 'GSTC Certified Excellence',
    description: 'Independently audited and certified by the Global Sustainable Tourism Council.'
  },
  {
    icon: Droplets,
    title: 'Zero-Waste & Clean Water',
    description: 'Solar-powered eco-camps featuring water purification and zero-single-use-plastic policies.'
  },
  {
    icon: Trees,
    title: 'Verified Carbon Offsetting',
    description: 'All safari miles are 100% carbon neutral through certified indigenous reforestation projects.'
  },
  {
    icon: TrendingUp,
    title: '$2M+ Reinvested Annually',
    description: 'Continuous investment in clean water access, solar power grids, and eco-schools for host communities.'
  }
];

export default function EcoTourismPage() {
  const [tours, setTours] = useState<Tour[]>(DEFAULT_TOURS);
  const [loadingTours, setLoadingTours] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  // Interactive Impact Calculator State
  const [calcDays, setCalcDays] = useState(4);
  const [calcPeople, setCalcPeople] = useState(2);

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
        if (response.ok) {
          const data = (await response.json()) as Tour[];
          if (Array.isArray(data) && data.length > 0) {
            setTours(data);
          }
        }
      } catch (error) {
        console.log('Using default tour catalog:', error);
      } finally {
        setLoadingTours(false);
      }
    };

    fetchEcoTours();
  }, []);

  // Filtered Tours Calculation
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesCategory = 
        activeCategory === 'all' || 
        (tour.category && tour.category.toLowerCase().includes(activeCategory.toLowerCase())) ||
        (tour.title && tour.title.toLowerCase().includes(activeCategory.toLowerCase()));
      
      const matchesSearch = 
        searchQuery.trim() === '' ||
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [tours, activeCategory, searchQuery]);

  // Calculated Impact
  const impactTrees = calcDays * calcPeople * 4;
  const impactCarbon = calcDays * calcPeople * 35; // kg CO2e
  const impactCommunity = calcDays * calcPeople * 25; // USD

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-black font-sans">
        {/* Top Scroll Progress */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 z-[100] origin-left shadow-[0_0_25px_rgba(16,185,129,0.8)]"
          style={{ scaleX }}
        />

        <Navbar />

        {/* Dedicated Domain Announcement Header Banner */}
        <div className="pt-28 md:pt-32 px-4">
          <div className="max-w-6xl mx-auto bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Dedicated Tourism Platform
                  </span>
                </div>
                <p className="text-sm md:text-base text-slate-200 font-medium mt-1">
                  Nechabest Eco-Tourism operations have moved to our official specialized platform at <strong className="text-emerald-400">adventures.nechabest.com</strong>
                </p>
              </div>
            </div>
            <a
              href="https://adventures.nechabest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all shrink-0 flex items-center gap-2"
            >
              Go to Adventures Site <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16">
          <HeroSlideshow
            images={[
              get('eco.hero.image', 'https://iili.io/3ovy0N9.jpg'),
              get('eco.hero.image2', 'https://iili.io/F2JCsIf.jpg'),
            ]}
            overlay="bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"
          >
            <AnimatedParticles count={30} />
          </HeroSlideshow>

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-xl shadow-xl">
                <Compass className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.25em]">
                  Sustainable Tourism & Safaris
                </span>
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
                Journey Through Africa.<br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent italic">
                  Leave a Living Legacy.
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                Discover Uganda’s breathtaking wilderness, mountain gorillas, and pristine lakes with certified eco-safaris that fund tree planting and community empowerment.
              </p>

              {/* Search & Filter Bar */}
              <div className="max-w-2xl mx-auto pt-4">
                <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/50 transition-all">
                  <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by safari title or location (e.g. Bwindi, Murchison)..."
                    className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href="https://adventures.nechabest.com/booking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-lg hover:bg-emerald-400 transition-all shrink-0 items-center gap-2"
                  >
                    Book Tour <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8">
              {[
                { label: 'Wildlife Safaris', val: '100% Carbon Neutral' },
                { label: 'Local Communities', val: '500+ Guides Employed' },
                { label: 'Conservation Fund', val: '$2M+ Reinvested' },
                { label: 'GSTC Certified', val: 'Global Excellence' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-md"
                >
                  <div className="text-emerald-400 font-extrabold text-sm md:text-base">{stat.val}</div>
                  <div className="text-slate-400 text-xs font-semibold mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Discovery & Tour Showcase */}
        <section id="tours" className="py-20 bg-slate-900/50 relative border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-12">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em]">
                Featured Eco-Safaris
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">
                Explore Sustainable <span className="text-emerald-400 italic">Adventures</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                Curated eco-tours designed to immerse you in wild nature while generating real environmental impact.
              </p>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${
                      activeCategory === cat.id
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tour Cards Grid */}
            {loadingTours ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
              </div>
            ) : filteredTours.length === 0 ? (
              <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <Info className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-300 font-semibold text-lg">No adventures matching your search filter.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30 border border-emerald-500/30"
                >
                  Reset Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTours.map((tour, idx) => (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ y: -8 }}
                    className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all flex flex-col"
                  >
                    {/* Card Image */}
                    <div className="relative h-60 overflow-hidden cursor-pointer" onClick={() => setSelectedTour(tour)}>
                      <Image
                        src={tour.image}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md rounded-full px-3.5 py-1.5 flex items-center gap-1.5 border border-slate-700 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white">{tour.rating || 4.9}</span>
                      </div>

                      {/* Location Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{tour.location}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 
                          onClick={() => setSelectedTour(tour)}
                          className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer leading-snug mb-2"
                        >
                          {tour.title}
                        </h3>
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                          {tour.description || 'Explore rich biodiversity and support conservation on this sustainable safari.'}
                        </p>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {(tour.highlights || ['Nature', 'Community', 'Eco-Lodge']).map((hl, i) => (
                          <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {hl}
                          </span>
                        ))}
                      </div>

                      {/* Card Footer Price & Action */}
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">From</div>
                          <div className="text-2xl font-extrabold text-white">
                            {typeof tour.price === 'number' ? `$${tour.price}` : tour.price}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTour(tour)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all"
                          >
                            Quick View
                          </button>
                          <a
                            href={`https://adventures.nechabest.com/booking?tour=${tour.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1"
                          >
                            Book <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Interactive Eco-Impact Calculator */}
        <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Trees className="w-4 h-4" /> Live Impact Estimator
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                  Calculate Your Travel <span className="text-emerald-400 italic">Impact</span>
                </h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Every day you spend on a Nechabest safari directly offsets carbon emissions, plants indigenous trees in forest corridors, and funds local schools.
                </p>

                {/* Sliders */}
                <div className="space-y-6 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                      <span>Safari Duration:</span>
                      <span className="text-emerald-400">{calcDays} Days</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={calcDays}
                      onChange={(e) => setCalcDays(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                      <span>Group Size:</span>
                      <span className="text-emerald-400">{calcPeople} Traveler{calcPeople > 1 ? 's' : ''}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={calcPeople}
                      onChange={(e) => setCalcPeople(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Calculator Output Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Trees className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white">{impactTrees} Trees</div>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">Planted in Rainforest Corridors</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-950/80 to-slate-900 border border-teal-500/30 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white">{impactCarbon} kg</div>
                    <div className="text-xs text-teal-400 font-semibold mt-0.5">CO2e Carbon Offsetting</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-950/80 to-slate-900 border border-green-500/30 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white">${impactCommunity}</div>
                    <div className="text-xs text-green-400 font-semibold mt-0.5">Direct Community Support Fund</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conservation Pillars Grid */}
        <section className="py-20 bg-slate-900/60 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em]">
                Our Guiding Principles
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">
                Six Pillars of <span className="text-emerald-400 italic">Conservation</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {IMPACT_PILLARS.map((pillar, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <pillar.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-t border-slate-800 text-center px-6 relative overflow-hidden">
          <AnimatedSparkles count={8} />
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Ready to Book Your <span className="text-emerald-400 italic">Uganda Eco-Safari?</span>
            </h2>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Visit our official specialized tourism platform <strong className="text-emerald-400">adventures.nechabest.com</strong> to choose custom dates, book permits, and secure your safari.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://adventures.nechabest.com/booking"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Book on Adventures Site <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://adventures.nechabest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-extrabold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Explore Adventures Platform
              </a>
            </div>
          </div>
        </section>

        {/* Tour Detail Modal */}
        <AnimatePresence>
          {selectedTour && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setSelectedTour(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
              >
                <button
                  onClick={() => setSelectedTour(null)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative h-64 shrink-0">
                  <Image
                    src={selectedTour.image}
                    alt={selectedTour.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-black">
                      {selectedTour.duration || 'Full Experience'}
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-2">{selectedTour.title}</h3>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MapPin className="w-4 h-4" /> {selectedTour.location}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {selectedTour.description || 'Experience an unforgettable sustainable adventure through natural habitats supported by dedicated local rangers.'}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safari Highlights:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTour.highlights || ['Wildlife Tracking', 'Eco-Lodge', 'Conservation Fund']).map((hl, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {hl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Price</div>
                      <div className="text-3xl font-extrabold text-emerald-400">
                        {typeof selectedTour.price === 'number' ? `$${selectedTour.price}` : selectedTour.price}
                      </div>
                    </div>
                    <a
                      href={`https://adventures.nechabest.com/booking?tour=${selectedTour.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-sm hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      Book on Adventures Site <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
