import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-36 md:px-12">
        <h1 className="font-display text-4xl font-bold md:text-6xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-white/60">Last updated: March 9, 2026</p>

        <div className="mt-10 space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using this website, you agree to these Terms of Service and all applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">2. Services</h2>
            <p className="mt-3">
              Nechabest Sustainable Initiatives provides sustainability information, tour booking requests,
              and communication channels for partnerships and support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">3. Booking Requests</h2>
            <p className="mt-3">
              Submitting a booking request does not guarantee final confirmation. Bookings are confirmed
              after internal review and direct follow-up with the customer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">4. User Responsibilities</h2>
            <p className="mt-3">
              You agree to provide accurate information and not misuse the platform, including fraudulent
              submissions, unauthorized access, or harmful activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">5. Intellectual Property</h2>
            <p className="mt-3">
              All content on this website, including branding, text, and design assets, is protected by
              applicable intellectual property laws unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">6. Limitation of Liability</h2>
            <p className="mt-3">
              The website is provided on an &quot;as is&quot; basis. We are not liable for indirect or consequential
              losses arising from use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">7. Contact</h2>
            <p className="mt-3">
              Questions about these terms can be sent to <a className="text-nature" href="mailto:info@nechabest.com">info@nechabest.com</a>.
            </p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
