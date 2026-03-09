import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-36 md:px-12">
        <h1 className="font-display text-4xl font-bold md:text-6xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-white/60">Last updated: March 9, 2026</p>

        <div className="mt-10 space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            <p className="mt-3">
              We collect personal information you provide directly, such as your name, email address,
              phone number, booking details, and contact form messages. We also collect limited technical
              information for analytics and site performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">2. How We Use Information</h2>
            <p className="mt-3">
              We use your information to process tour bookings, respond to inquiries, improve our services,
              send requested updates, and maintain platform security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">3. Data Sharing</h2>
            <p className="mt-3">
              We do not sell personal information. We may share data with trusted service providers who
              support website operations, booking management, and communication services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">4. Data Retention</h2>
            <p className="mt-3">
              We retain personal data only as long as needed for operational, legal, and security purposes.
              You may request deletion of your personal data where applicable by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">5. Your Rights</h2>
            <p className="mt-3">
              Depending on your jurisdiction, you may request access, correction, or deletion of your personal
              information. Contact us at <a className="text-nature" href="mailto:info@nechabest.com">info@nechabest.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">6. Contact</h2>
            <p className="mt-3">
              For privacy-related questions, email <a className="text-nature" href="mailto:info@nechabest.com">info@nechabest.com</a>
              {' '}or call <span className="text-nature">+256 763 860866</span>.
            </p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
