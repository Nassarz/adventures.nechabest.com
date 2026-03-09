import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-36 md:px-12">
        <h1 className="font-display text-4xl font-bold md:text-6xl">Cookie Policy</h1>
        <p className="mt-4 text-sm text-white/60">Last updated: March 9, 2026</p>

        <div className="mt-10 space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white">1. What Are Cookies</h2>
            <p className="mt-3">
              Cookies are small text files stored on your device to help websites function and improve user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">2. Cookies We Use</h2>
            <p className="mt-3">
              We use essential cookies for authentication and site operation, plus analytics cookies to understand
              traffic and improve performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">3. Managing Cookies</h2>
            <p className="mt-3">
              You can control or disable cookies through your browser settings. Some features may not work
              correctly if essential cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">4. Third-Party Services</h2>
            <p className="mt-3">
              Some third-party tools used on this site may set their own cookies in line with their policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">5. Contact</h2>
            <p className="mt-3">
              For cookie policy questions, contact <a className="text-nature" href="mailto:info@nechabest.com">info@nechabest.com</a>.
            </p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
