import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Nechabest Sustainable Initiatives | Our Mission & Vision',
  description: 'Learn about Nechabest Sustainable Initiatives - combining science and social values to deliver effective solutions for water, energy, and environmental management across Africa.',
  keywords: [
    'about nechabest',
    'sustainable development africa',
    'environmental conservation africa',
    'community-driven solutions',
    'mission vision values',
    'eco-tourism africa',
    'renewable energy africa',
    'water management africa',
    'sustainability initiatives'
  ],
  openGraph: {
    title: 'About Nechabest Sustainable Initiatives',
    description: 'Fostering sustainable development across Africa through community-driven solutions that enhance environmental conservation and improve livelihoods.',
    url: 'https://nechabest.com/about',
    type: 'website',
    images: [
      {
        url: 'https://nechabest.com/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'Nechabest Sustainable Initiatives Team'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Nechabest Sustainable Initiatives',
    description: 'Building a sustainable future for Africa through innovation, community partnerships, and environmental stewardship.',
    images: ['https://nechabest.com/og-about.jpg']
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
