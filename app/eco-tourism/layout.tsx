import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eco-Tourism Experiences - Nechabest Sustainable Initiatives | Africa Adventures',
  description: 'Explore Africa\'s natural wonders with purpose. Sustainable eco-tourism packages that support conservation and local communities. Book your adventure today.',
  keywords: [
    'eco-tourism africa',
    'sustainable tourism',
    'wildlife safari',
    'conservation tourism',
    'community tourism',
    'mountain trekking',
    'rainforest tours',
    'eco-lodges',
    'responsible travel',
    'nature conservation'
  ],
  openGraph: {
    title: 'Eco-Tourism Experiences - Sustainable Adventures Across Africa',
    description: 'Join our curated eco-tourism experiences that create lasting positive impact for nature and communities.',
    url: 'https://nechabest.com/eco-tourism',
    type: 'website',
    images: [
      {
        url: 'https://nechabest.com/og-eco-tourism.jpg',
        width: 1200,
        height: 630,
        alt: 'Eco-Tourism Experience'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eco-Tourism Experiences with Nechabest',
    description: 'Sustainable adventures supporting conservation and communities across Africa.',
    images: ['https://nechabest.com/og-eco-tourism.jpg']
  }
};

export default function EcoTourismLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
