import type { Metadata } from 'next';
import { Inter, Alfa_Slab_One } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ChunkErrorBoundary } from '@/components/ChunkErrorBoundary';
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler';
import ViewTracker from '@/components/ViewTracker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const display = Alfa_Slab_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  preload: false,
  display: 'swap',
  fallback: ['Impact', 'Arial Black', 'sans-serif'],
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
  const publishableKey = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').replace(/\$/g, '');
  const hasClerkKeys = Boolean(publishableKey);

  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        <ChunkErrorHandler />
        <ChunkErrorBoundary>
          {hasClerkKeys ? (
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
