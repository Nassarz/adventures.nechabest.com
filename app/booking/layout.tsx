import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Your Tour | Nechabest - Secure Booking System',
  description:
    'Book your eco-tourism adventure with our secure booking system. Choose your tour, select dates, and complete your reservation in minutes.',
  keywords: [
    'book tour',
    'tour booking',
    'eco-tourism booking',
    'secure booking',
    'online reservation',
    'travel booking',
    'safari booking',
  ],
  authors: [{ name: 'Nechabest' }],
  openGraph: {
    type: 'website',
    url: 'https://nechabest.com/booking',
    title: 'Book Your Tour | Nechabest',
    description: 'Secure online booking for eco-tourism adventures across Africa.',
    siteName: 'Nechabest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Your Tour | Nechabest',
    description: 'Secure online booking for eco-tourism adventures.',
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
