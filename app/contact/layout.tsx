import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Nechabest - Get In Touch',
  description:
    'Have questions about our eco-tourism tours or want to partner with us? Contact Nechabest and we\'ll get back to you within 24 hours.',
  keywords: [
    'contact us',
    'nechabest contact',
    'eco-tourism inquiry',
    'book a tour',
    'partnership',
    'support',
    'help',
    'get in touch',
  ],
  authors: [{ name: 'Nechabest' }],
  openGraph: {
    type: 'website',
    url: 'https://nechabest.com/contact',
    title: 'Contact Us | Nechabest - Get In Touch',
    description:
      'Have questions about our eco-tourism tours or want to partner with us? Contact Nechabest and we\'ll get back to you within 24 hours.',
    siteName: 'Nechabest',
    images: [
      {
        url: 'https://picsum.photos/1200/630?random=200',
        width: 1200,
        height: 630,
        alt: 'Contact Nechabest',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Nechabest',
    description: 'Get in touch with our team. We respond within 24 hours.',
    images: ['https://picsum.photos/1200/630?random=200'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
