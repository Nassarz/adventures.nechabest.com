'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Users, Mail, Phone, CreditCard, CheckCircle, AlertCircle, Sparkles, MapPin, Clock, DollarSign, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSiteContent } from '@/hooks/useSiteContent';

interface Tour {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  maxPeople: number;
}

interface ApiTour {
  id: string;
  title?: string;
  location?: string;
  price?: number | string;
  duration?: string;
  image?: string;
  group?: string;
  maxPeople?: number;
}

interface BookingData {
  tourId: string;
  fullName: string;
  email: string;
  phone: string;
  startDate: string;
  numberOfPeople: number;
  specialRequests: string;
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface FormErrors {
  [key: string]: string;
}

const extractMaxPeople = (group?: string): number => {
  const groupMatch = group?.match(/(\d+)/);
  if (groupMatch) return Number(groupMatch[1]);
  return 20;
};

const normalizePrice = (price?: number | string): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = Number(price.replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeTour = (tour: ApiTour): Tour => ({
  id: tour.id,
  title: tour.title || 'Untitled Tour',
  location: tour.location || 'Uganda',
  price: normalizePrice(tour.price),
  duration: tour.duration || 'Flexible',
  image: tour.image || 'https://picsum.photos/seed/tour/800/600',
  maxPeople: Number.isFinite(tour.maxPeople) ? Number(tour.maxPeople) : extractMaxPeople(tour.group),
});

export default function Booking() {
  const { get } = useSiteContent('booking');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [step, setStep] = useState(1);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [toursError, setToursError] = useState('');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    tourId: '',
    fullName: '',
    email: '',
    phone: '',
    startDate: '',
    numberOfPeople: 1,
    specialRequests: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoadingTours(true);
        setToursError('');
        const response = await fetch('/api/tours', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load tours');
        }
        const data = (await response.json()) as ApiTour[];
        const normalized = data.map(normalizeTour);
        setTours(normalized);

        const params = new URLSearchParams(window.location.search);
        const tourId = params.get('tour');
        if (tourId) {
          const preSelectedTour = normalized.find((tour) => tour.id === tourId);
          if (preSelectedTour) {
            setSelectedTour(preSelectedTour);
            setBookingData((prev) => ({ ...prev, tourId: preSelectedTour.id }));
          }
        }
      } catch (error) {
        console.error('Error loading tours for booking:', error);
        setTours([]);
        setToursError('Unable to load tours right now. Please try again shortly.');
      } finally {
        setLoadingTours(false);
      }
    };

    fetchTours();
  }, []);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!bookingData.tourId) newErrors.tourId = 'Please select a tour';
      if (!bookingData.startDate) newErrors.startDate = 'Please select a start date';
      if (bookingData.numberOfPeople < 1) newErrors.numberOfPeople = 'At least 1 person required';
      if (selectedTour && bookingData.numberOfPeople > selectedTour.maxPeople) {
        newErrors.numberOfPeople = `Maximum ${selectedTour.maxPeople} people allowed`;
      }
    }

    if (currentStep === 2) {
      if (!bookingData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!bookingData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) newErrors.email = 'Invalid email format';
      if (!bookingData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[\d\s\-\+\(\)]+$/.test(bookingData.phone)) newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name as keyof FormErrors];
      setErrors(newErrors);
    }
  };

  const handleTourSelect = (tour: Tour) => {
    setSelectedTour(tour);
    setBookingData(prev => ({ ...prev, tourId: tour.id }));
    if (errors.tourId) {
      const newErrors = { ...errors };
      delete newErrors.tourId;
      setErrors(newErrors);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: bookingData.tourId,
          tourTitle: selectedTour?.title || '',
          fullName: bookingData.fullName,
          email: bookingData.email,
          phone: bookingData.phone,
          numberOfPeople: bookingData.numberOfPeople,
          bookingDate: bookingData.startDate,
          totalPrice,
          specialRequests: bookingData.specialRequests || ''
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit booking');
      }

      setLoading(false);
      setConfirmed(true);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Booking submission error:', error);
      setLoading(false);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit booking. Please try again.' });
    }
  };

  const totalPrice = selectedTour ? selectedTour.price * bookingData.numberOfPeople : 0;

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black selection:bg-nature selection:text-black">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-nature z-[100] origin-left shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{ scaleX }}
        />

        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-32 pb-16 md:pt-40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-nature/10" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-nature" />
                <span className="text-nature font-bold uppercase tracking-[0.2em] text-xs">Secure Booking</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                {get('booking.hero.title', 'Book Your Adventure')}
              </h1>

              {!confirmed && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        step >= s ? 'bg-nature text-white' : 'bg-white/20 text-white/50'
                      }`}>
                        {s}
                      </div>
                      {s < 3 && <div className={`w-8 h-[2px] ${step > s ? 'bg-nature' : 'bg-white/20'}`} />}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-12">
            {/* Step 1: Tour Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-primary">Select Your Tour</h2>
                  <p className="text-foreground/60 text-lg">Choose the adventure that speaks to you</p>
                </div>

                {errors.tourId && <p className="text-red-600 text-center font-medium flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.tourId}</p>}

                {loadingTours ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-nature" />
                  </div>
                ) : toursError ? (
                  <div className="text-center py-10">
                    <p className="text-red-600 font-semibold">{toursError}</p>
                  </div>
                ) : tours.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-foreground/70 font-semibold">No tours available yet.</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {tours.map((tour, i) => (
                    <motion.div
                      key={tour.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      onClick={() => handleTourSelect(tour)}
                      className={`group cursor-pointer rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${
                        selectedTour?.id === tour.id ? 'border-nature ring-4 ring-nature/20' : 'border-black/10 hover:border-nature/50'
                      }`}
                    >
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={tour.image}
                          alt={tour.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-1000"
                          referrerPolicy="no-referrer"
                        />
                        {selectedTour?.id === tour.id && (
                          <div className="absolute top-4 right-4 w-8 h-8 md:w-10 md:h-10 bg-nature rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="p-6 md:p-8 space-y-4">
                        <h3 className="font-display text-xl md:text-2xl font-bold text-primary">{tour.title}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-foreground/60">
                            <MapPin className="w-4 h-4 text-nature" />
                            {tour.location}
                          </div>
                          <div className="flex items-center gap-2 text-foreground/60">
                            <Clock className="w-4 h-4 text-nature" />
                            {tour.duration}
                          </div>
                          <div className="flex items-center gap-2 text-foreground/60">
                            <Users className="w-4 h-4 text-nature" />
                            Max {tour.maxPeople} people
                          </div>
                        </div>
                        <div className="pt-4 border-t border-black/10">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/60 text-sm font-bold uppercase tracking-widest">Price</span>
                            <span className="text-2xl font-bold text-primary">${tour.price}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                )}

                {selectedTour && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-50 rounded-2xl p-6 md:p-8 space-y-6"
                  >
                    <h3 className="font-bold text-xl text-primary">Tour Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block font-bold text-foreground text-sm">Start Date *</label>
                        <input
                          type="date"
                          name="startDate"
                          value={bookingData.startDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}                        autoComplete="off"                          className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition focus:outline-none ${
                            errors.startDate ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-primary'
                          }`}
                        />
                        {errors.startDate && <p className="text-red-600 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.startDate}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block font-bold text-foreground text-sm">Number of People *</label>
                        <input
                          type="number"
                          name="numberOfPeople"
                          value={bookingData.numberOfPeople}
                          onChange={handleChange}
                          min={1}
                          max={selectedTour.maxPeople}
                          autoComplete="off"
                          className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition focus:outline-none ${
                            errors.numberOfPeople ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-primary'
                          }`}
                        />
                        {errors.numberOfPeople && <p className="text-red-600 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.numberOfPeople}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-black/10">
                      <span className="text-lg font-bold text-foreground/60">Total Price:</span>
                      <span className="text-3xl md:text-4xl font-bold text-primary">${totalPrice}</span>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    className="bg-gradient-to-r from-primary to-nature text-white font-bold py-4 px-12 rounded-xl hover:shadow-xl transition-all"
                  >
                    Continue to Personal Details →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-primary">Your Details</h2>
                  <p className="text-foreground/60 text-lg">We need some information to complete your booking</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-8 md:p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="block font-bold text-foreground">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={bookingData.fullName}
                      onChange={handleChange}
                      placeholder="Name here"
                      autoComplete="off"
                      className={`w-full px-6 py-4 rounded-xl border-2 font-medium transition focus:outline-none ${
                        errors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'
                      }`}
                    />
                    {errors.fullName && <p className="text-red-600 text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-bold text-foreground">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={bookingData.email}
                        onChange={handleChange}
                        placeholder="info@nechabest.com"
                        autoComplete="off"
                        className={`w-full px-6 py-4 rounded-xl border-2 font-medium transition focus:outline-none ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'
                        }`}
                      />
                      {errors.email && <p className="text-red-600 text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block font-bold text-foreground">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleChange}
                        placeholder="+256 700 000 000"
                        autoComplete="off"
                        className={`w-full px-6 py-4 rounded-xl border-2 font-medium transition focus:outline-none ${
                          errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'
                        }`}
                      />
                      {errors.phone && <p className="text-red-600 text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-bold text-foreground">Special Requests (Optional)</label>
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleChange}
                      placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                      rows={4}
                      className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 bg-white font-medium transition focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={prevStep}
                    className="bg-slate-200 text-foreground font-bold py-4 px-8 rounded-xl hover:bg-slate-300 transition-all"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    className="bg-gradient-to-r from-primary to-nature text-white font-bold py-4 px-12 rounded-xl hover:shadow-xl transition-all"
                  >
                    Review Booking →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Booking Confirmation */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-primary">Review Your Booking</h2>
                  <p className="text-foreground/60 text-lg">Please review your details before submitting</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-blue-50 border border-blue-200 rounded-2xl p-8 md:p-10 space-y-6">
                    {/* Important Notice */}
                    <div className="bg-white border-l-4 border-nature rounded-lg p-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-nature flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-bold text-lg text-nature mb-2">Payment Handled Separately</h3>
                          <p className="text-foreground/70 leading-relaxed">
                            In compliance with Uganda Tourism Board regulations, payments are processed outside our platform to ensure your security. After submitting this form, our team will contact you within 24 hours at the phone number and email provided to confirm your booking details and arrange secure payment options.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-white rounded-lg p-6 space-y-4">
                      <h3 className="font-bold text-lg text-primary">Booking Summary</h3>
                      {selectedTour && (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Tour:</span>
                            <span className="font-bold text-foreground">{selectedTour.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Location:</span>
                            <span className="font-bold text-foreground">{selectedTour.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Start Date:</span>
                            <span className="font-bold text-foreground">{bookingData.startDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Number of People:</span>
                            <span className="font-bold text-foreground">{bookingData.numberOfPeople}</span>
                          </div>
                          <div className="border-t border-slate-200 pt-3 flex justify-between">
                            <span className="text-foreground/60 font-bold">Estimated Price:</span>
                            <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Personal Info Confirmation */}
                    <div className="bg-white rounded-lg p-6 space-y-3">
                      <h3 className="font-bold text-lg text-primary">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Name:</span>
                          <span className="font-bold text-foreground">{bookingData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Email:</span>
                          <span className="font-bold text-foreground">{bookingData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Phone:</span>
                          <span className="font-bold text-foreground">{bookingData.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="bg-white rounded-lg p-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          className="w-5 h-5 mt-1 cursor-pointer"
                        />
                        <span className="text-sm text-foreground/70">
                          I confirm that all the information above is correct and I understand that our team will contact me to finalize the booking and arrange payment.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
                      <h3 className="font-bold text-lg text-primary">Booking Summary</h3>
                      {selectedTour && (
                        <>
                          <div className="space-y-2 text-sm">
                            <p className="font-bold text-foreground">{selectedTour.title}</p>
                            <p className="text-foreground/60">{bookingData.startDate}</p>
                            <p className="text-foreground/60">{bookingData.numberOfPeople} {bookingData.numberOfPeople === 1 ? 'person' : 'people'}</p>
                          </div>
                          <div className="pt-4 border-t border-primary/20 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-foreground/60">Subtotal:</span>
                              <span className="font-bold">${totalPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-foreground/60">Service Fee:</span>
                              <span className="font-bold">$0</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-primary/20">
                              <span className="font-bold text-primary">Total:</span>
                              <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={prevStep}
                    className="bg-slate-200 text-foreground font-bold py-4 px-8 rounded-xl hover:bg-slate-300 transition-all"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-nature text-white font-bold py-4 px-12 rounded-xl hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Complete Booking
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && confirmed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl mx-auto text-center space-y-8"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-green-600" />
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="font-display text-3xl md:text-5xl font-bold text-primary">Booking Confirmed!</h2>
                    <p className="text-lg text-foreground/60">Your adventure awaits</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-8 space-y-4 text-left">
                    <h3 className="font-bold text-xl text-primary text-center mb-4">Booking Details</h3>
                    {selectedTour && (
                      <div className="space-y-3 text-sm md:text-base">
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Tour:</span>
                          <span className="font-bold text-foreground">{selectedTour.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Date:</span>
                          <span className="font-bold text-foreground">{bookingData.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">People:</span>
                          <span className="font-bold text-foreground">{bookingData.numberOfPeople}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Name:</span>
                          <span className="font-bold text-foreground">{bookingData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Email:</span>
                          <span className="font-bold text-foreground">{bookingData.email}</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-black/10">
                          <span className="text-foreground/60">Total Paid:</span>
                          <span className="text-2xl font-bold text-green-600">${totalPrice}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm text-blue-900 text-left">
                    <p className="font-bold mb-2">📧 Confirmation Email Sent</p>
                    <p>We&apos;ve sent a confirmation email to {bookingData.email} with your booking details and next steps.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <motion.a
                      href="/"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-primary to-nature text-white font-bold py-4 px-8 rounded-xl hover:shadow-xl transition-all text-center"
                    >
                      Return Home
                    </motion.a>
                    <motion.a
                      href="/eco-tourism"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-slate-200 text-foreground font-bold py-4 px-8 rounded-xl hover:bg-slate-300 transition-all text-center"
                    >
                      Browse More Tours
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
