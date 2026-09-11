'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-16 md:pt-40 md:pb-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-8">
          <h1 className="font-display text-4xl font-bold text-primary">Privacy Policy</h1>
          <div className="prose prose-lg text-foreground/70 space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Nechabest Sustainable Adventures (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the adventures.nechabest.com website. This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our service.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Information Collection and Use</h2>
            <p>We collect information you provide directly to us, such as when you book a tour, subscribe to our newsletter, or contact us. This may include your name, email address, phone number, and payment information.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Use of Data</h2>
            <p>We use the collected data to provide and maintain our service, to notify you about changes to our service, to provide customer support, and to gather analysis so that we can improve our service.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Data Security</h2>
            <p>The security of your data is important to us. We strive to use commercially acceptable means of protecting your personal information, but no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at info@nechabest.com.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
