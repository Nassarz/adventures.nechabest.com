import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ChunkErrorBoundary } from '@/components/ChunkErrorBoundary';
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler';
import ViewTracker from '@/components/ViewTracker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const display = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nechabest Sustainable Initiatives | Building a Greener Uganda',
  description: 'Empowering Ugandan communities through clean water, renewable energy, climate-smart farming, and eco-tourism. Join us in building a sustainable future for people and nature.',
  keywords: ['sustainable development', 'Uganda', 'clean water', 'renewable energy', 'eco-tourism', 'climate-smart farming', 'environmental conservation'],
  authors: [{ name: 'Nechabest Sustainable Initiatives' }],
  creator: 'Nechabest Sustainable Initiatives',
  publisher: 'Nechabest Sustainable Initiatives',
  icons: {
    icon: 'https://iili.io/ffrDkkN.png',
    apple: 'https://iili.io/ffrDckN.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    url: 'https://nechabest.org',
    siteName: 'Nechabest Sustainable Initiatives',
    title: 'Nechabest Sustainable Initiatives | Building a Greener Uganda',
    description: 'Empowering Ugandan communities through clean water, renewable energy, climate-smart farming, and eco-tourism.',
    images: [
      {
        url: 'https://iili.io/fdC0KF9.jpg',
        width: 1200,
        height: 630,
        alt: 'Nechabest Sustainable Initiatives',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nechabest Sustainable Initiatives',
    description: 'Building a Sustainable Future for People and Nature in Uganda',
    images: ['https://iili.io/fdC0KF9.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKeyRaw = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').replace(/\$/g, '').trim();
  const publishableKey = publishableKeyRaw.match(/(pk_(?:test|live)_[A-Za-z0-9._-]+)/)?.[1] || '';

  // Only use ClerkProvider when a valid key is present AND we're in production.
  // The live key (pk_live_) requires clerk.nechabest.com which is unreachable on localhost.
  // On localhost, admin auth uses a local password session instead (see /admin/dev-login).
  const isProduction = process.env.NODE_ENV === 'production';
  const useClerk = isProduction && publishableKey.startsWith('pk_live_');

  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        <ChunkErrorHandler />
        <ChunkErrorBoundary>
          {useClerk ? (
            <ClerkProvider publishableKey={publishableKey}>
              <ViewTracker />
              {children}
            </ClerkProvider>
          ) : (
            <>
              <ViewTracker />
              {children}
            </>
          )}
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
