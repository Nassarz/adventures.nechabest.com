'use client';

import React, { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSiteContent } from '@/hooks/useSiteContent';
import HeroSlideshow from '@/components/HeroSlideshow';
import { submitContactForm } from '@/lib/formspree';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  _gotcha?: string; // Honeypot field for bot protection
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const { get } = useSiteContent('contact');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    _gotcha: '' // Honeypot field (must remain empty)
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) newErrors.phone = 'Invalid phone format';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Submit to Formspree with security measures
      const result = await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        _gotcha: formData._gotcha // Honeypot for bot protection
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit form');
      }

      // Success - clear form and show success message
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Contact form submission error:', error);
      setLoading(false);
      setErrors({ 
        ...errors, 
        message: error instanceof Error ? error.message : 'Failed to submit form. Please try again.' 
      });
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: get('global.footer.emailPrimary', 'info@nechabest.com'),
      description: 'Send us an email and we\'ll respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: get('global.footer.phone', '+256 763 860866'),
      description: 'Call us during business hours (Mon-Fri 9am-5pm UTC)'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Kasangati Town Council, Plot 616 Block 174, Kabanyolo, Kyadondo County, Wakiso District',
      description: 'Visit our office or arrange a meeting'
    },
  ];

  const subjects = [
    'General Inquiry',
    'Tour Booking',
    'Partnership Opportunity',
    'Feedback',
    'Technical Support',
    'Other'
  ];

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
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-32 pb-16 md:pt-40">
          {/* Background Slideshow */}
          <HeroSlideshow
            images={[
              get('contact.hero.image', 'https://iili.io/fMclk92.jpg'),
              get('contact.hero.image2', 'https://iili.io/fdCAigf.jpg'),
            ]}
            overlay="bg-gradient-to-br from-black/75 via-primary/60 to-nature/60"
          />

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5 text-nature" />
                <span className="text-nature font-bold uppercase tracking-[0.2em] text-xs">Get In Touch</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                {get('contact.hero.title', "Let's Connect")}
              </h1>

              <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                {get('contact.hero.subtitle', "Have questions about our tours or partnerships? We'd love to hear from you. Reach out to us anytime.")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-16 md:mb-24">
              {contactMethods.map((method, i) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="group text-center space-y-4"
                  >
                    <div className="flex justify-center">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                        <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg md:text-xl text-primary">{method.title}</h3>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{method.value}</p>
                    <p className="text-foreground/60 text-sm md:text-base">{method.description}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact Form & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Success Message */}
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-green-900">Message sent successfully!</p>
                        <p className="text-sm text-green-700">We&apos;ll get back to you soon.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block font-bold text-foreground text-sm md:text-base">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name here"
                      className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border-2 font-medium transition focus:outline-none ${
                        errors.name
                          ? 'border-red-300 bg-red-50 focus:border-red-500'
                          : 'border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                    />
                    {errors.name && <p className="text-red-600 text-xs md:text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block font-bold text-foreground text-sm md:text-base">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@nechabest.com"
                      className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border-2 font-medium transition focus:outline-none ${
                        errors.email
                          ? 'border-red-300 bg-red-50 focus:border-red-500'
                          : 'border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                    />
                    {errors.email && <p className="text-red-600 text-xs md:text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                  </div>

                  {/* Phone & Subject Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block font-bold text-foreground text-sm md:text-base">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+256 700 000 000"
                        className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border-2 font-medium transition focus:outline-none ${
                          errors.phone
                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                      />
                      {errors.phone && <p className="text-red-600 text-xs md:text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label className="block font-bold text-foreground text-sm md:text-base">Subject *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border-2 font-medium transition focus:outline-none appearance-none bg-white cursor-pointer ${
                          errors.subject
                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                        style={{
                          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%221a4d2e%22 stroke-width=%222%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="">Select a subject...</option>
                        {subjects.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.subject && <p className="text-red-600 text-xs md:text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.subject}</p>}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="block font-bold text-foreground text-sm md:text-base">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border-2 font-medium transition focus:outline-none resize-none ${
                        errors.message
                          ? 'border-red-300 bg-red-50 focus:border-red-500'
                          : 'border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                    />
                    {errors.message && <p className="text-red-600 text-xs md:text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.message}</p>}
                  </div>

                  {/* Honeypot field - hidden from users, catches bots */}
                  <input
                    type="text"
                    name="_gotcha"
                    value={formData._gotcha}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      width: '1px',
                      height: '1px',
                      opacity: 0,
                      pointerEvents: 'none'
                    }}
                    aria-hidden="true"
                  />

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-nature text-white font-bold py-3 md:py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Business Hours */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 space-y-4">
                  <h3 className="font-bold text-lg md:text-xl text-primary">Business Hours</h3>
                  <div className="space-y-2 text-foreground/70 text-sm md:text-base">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="font-bold text-foreground">9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-bold text-foreground">10:00 AM - 3:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-bold text-foreground">Closed</span>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-nature/5 border border-nature/20 rounded-2xl p-6 md:p-8 space-y-4">
                  <h3 className="font-bold text-lg md:text-xl text-nature">Response Time</h3>
                  <p className="text-foreground/60 text-sm md:text-base leading-relaxed">
                    We typically respond to inquiries within 24 hours during business days. For urgent matters, please call us directly.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="bg-slate-100 rounded-2xl p-6 md:p-8 space-y-4">
                  <h3 className="font-bold text-lg md:text-xl text-foreground">More Resources</h3>
                  <div className="space-y-2 text-foreground/60 text-sm md:text-base">
                    <Link href="/" className="block hover:text-primary transition">→ View Tours</Link>
                    <Link href="/blog" className="block hover:text-primary transition">→ Read Blog</Link>
                    <a href="/about" className="block hover:text-primary transition">→ About Us</a>
                    <a href="/eco-tourism" className="block hover:text-primary transition">→ Eco-Tourism</a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </ErrorBoundary>
  );
}
