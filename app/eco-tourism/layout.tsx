import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nechabest Adventures | Eco-Tourism Tours in Uganda & Africa',
  description:
    "Nechabest Adventures — Uganda's premium eco-tourism experiences. Wildlife safaris, gorilla trekking, nature adventures and cultural tours that fund conservation. Book your Nechabest adventure today.",
  keywords: [
    'nechabest adventures',
    'Nechabest eco tours',
    'Uganda safari',
    'eco-tourism Uganda',
    'sustainable tourism',
    'wildlife safari',
    'gorilla trekking Uganda',
    'conservation tourism',
    'community tourism',
    'mountain trekking',
    'rainforest tours',
    'eco-lodges',
    'responsible travel',
    'nature conservation',
    'Uganda travel',
    'African adventures',
  ],
  alternates: {
    canonical: '/eco-tourism',
  },
  openGraph: {
    title: 'Nechabest Adventures | Eco-Tourism Tours in Uganda & Africa',
    description:
      'Explore Uganda with Nechabest Adventures — sustainable safaris and nature experiences that create lasting impact for communities and the environment.',
    url: 'https://nechabest.com/eco-tourism',
    type: 'website',
    images: [
      {
        url: 'https://iili.io/3ovy0N9.jpg',
        width: 1200,
        height: 630,
        alt: 'Nechabest Adventures Eco-Tourism Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nechabest Adventures | Eco-Tourism in Uganda',
    description:
      'Sustainable safaris and nature experiences with Nechabest Adventures — booking open now.',
    images: ['https://iili.io/3ovy0N9.jpg'],
  },
};

export default function EcoTourismLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}