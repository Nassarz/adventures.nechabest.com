'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-16 md:pt-40 md:pb-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-8">
          <h1 className="font-display text-4xl font-bold text-primary">Terms of Service</h1>
          <div className="prose prose-lg text-foreground/70 space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>These Terms of Service govern your use of the adventures.nechabest.com website and services offered by Nechabest Sustainable Adventures.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Booking Terms</h2>
            <p>All bookings are subject to availability and confirmation. A deposit may be required to secure your reservation. Full payment terms will be communicated upon booking confirmation.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Cancellation Policy</h2>
            <p>Cancellations made 30 or more days before the tour date may receive a full refund. Cancellations within 30 days may be subject to a cancellation fee. Please contact us for specific terms.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Liability</h2>
            <p>Nechabest Sustainable Adventures acts as an organizer for tour packages. We are not liable for any injury, loss, or damage that may occur during tours. Participants are responsible for their own safety and should have appropriate travel insurance.</p>
            <h2 className="font-display text-2xl font-bold text-primary">Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at info@nechabest.com.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
