'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-16 md:pt-40 md:pb-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-8">
          <h1 className="font-display text-4xl font-bold text-primary">Cookie Policy</h1>
          <div className="prose prose-lg text-foreground/70 space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>This Cookie Policy explains how Nechabest Sustainable Adventures uses cookies on our website.</p>
            <h2 className="font-display text-2xl font-bold text-primary">What Are Cookies</h2>
            <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.</p>
            <h2 className="font-display text-2xl font-bold text-primary">How We Use Cookies</h2>
            <p>We use cookies for authentication, to remember your preferences, and to analyze how our website is used. This helps us improve your experience.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Managing Cookies</h2>
            <p>You can control and manage cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Contact Us</h2>
            <p>If you have any questions about our Cookie Policy, please contact us at info@nechabest.com.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
