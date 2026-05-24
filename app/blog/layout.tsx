import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eco-Insights Blog | Sustainable Travel & Conservation Stories',
  description:
    'Discover articles on sustainable tourism, wildlife conservation, eco-lodges, and responsible travel tips across Africa.',
  keywords: [
    'eco-tourism blog',
    'sustainable travel',
    'wildlife conservation',
    'eco-travel tips',
    'African safaris',
    'responsible tourism',
    'travel stories',
    'conservation news',
    'eco-lodges',
    'sustainable living',
  ],
  authors: [{ name: 'Nechabest' }],
  openGraph: {
    type: 'website',
    url: 'https://nechabest.com/blog',
    title: 'Eco-Insights Blog | Sustainable Travel & Conservation Stories',
    description:
      'Discover articles on sustainable tourism, wildlife conservation, eco-lodges, and responsible travel tips across Africa.',
    siteName: 'Nechabest',
    images: [
      {
        url: 'https://iili.io/fdClSYg.png',
        width: 1200,
        height: 630,
        alt: 'Eco-Insights Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eco-Insights Blog | Sustainable Travel & Conservation Stories',
    description:
      'Discover articles on sustainable tourism, wildlife conservation, eco-lodges, and responsible travel tips.',
    images: ['https://iili.io/fdClSYg.png'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
