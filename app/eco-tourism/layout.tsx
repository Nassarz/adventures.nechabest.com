import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.nechabest.com'),
  title: {
    absolute: 'Nechabest Sustainable Adventures | Eco-Tourism Tours in Uganda & Africa',
  },
  description:
    "Book Uganda eco-tourism adventures with Nechabest Sustainable Adventures — a trusted, reliable tourism company. Wildlife safaris, gorilla trekking, nature tours and cultural experiences that fund conservation. Visit https://www.nechabest.com/eco-tourism to book your adventure.",
  keywords: [
    'nechabest sustainable adventures',
    'Nechabest Adventures',
    'Nechabest eco tours',
    'reliable tourism company Uganda',
    'trusted travel agency Uganda',
    'Uganda safari company',
    'Uganda eco-tourism',
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
    'Uganda tours and safaris',
    'African adventures',
    'eco-tourism tours',
    'adventure travel Uganda',
    'bird watching Uganda',
    'wildlife tours Africa',
  ],
  alternates: {
    canonical: '/eco-tourism',
  },
  openGraph: {
    title: 'Nechabest Sustainable Adventures | Eco-Tourism Tours in Uganda & Africa',
    description:
      'Explore Uganda with Nechabest Sustainable Adventures — sustainable safaris and nature experiences that create lasting impact for communities and the environment. Book your adventure at www.nechabest.com/eco-tourism.',
    url: 'https://www.nechabest.com/eco-tourism',
    siteName: 'Nechabest Sustainable Initiatives',
    type: 'website',
    locale: 'en_UG',
    images: [
      {
        url: 'https://iili.io/3ovy0N9.jpg',
        width: 1200,
        height: 630,
        alt: 'Nechabest Sustainable Adventures Eco-Tourism Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nechabest Sustainable Adventures | Eco-Tourism in Uganda',
    description:
      'Sustainable safaris and nature experiences with Nechabest Sustainable Adventures — booking open now at www.nechabest.com/eco-tourism.',
    images: ['https://iili.io/3ovy0N9.jpg'],
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
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Nechabest Sustainable Adventures',
  alternateName: 'Nechabest Eco-Tourism',
  url: 'https://www.nechabest.com/eco-tourism',
  logo: 'https://iili.io/ffrDkkN.png',
  image: 'https://iili.io/3ovy0N9.jpg',
  description:
    'A reliable, sustainable tourism company in Uganda offering wildlife safaris, gorilla trekking, nature and cultural tours that fund conservation and support local communities.',
  slogan: 'Together for a Greener Future',
  telephone: '+256756310029',
  email: 'bookings@nechabest.com',
  priceRange: '$$',
  areaServed: ['Uganda', 'East Africa', 'Africa'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kasangati',
    addressRegion: 'Wakiso District',
    addressCountry: 'UG',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0.4439,
    longitude: 32.5903,
  },
  makesOffer: [
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Wildlife Safaris',
        serviceType: 'Eco-Tourism Safari',
        url: 'https://www.nechabest.com/eco-tourism',
      },
    },
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Gorilla Trekking',
        serviceType: 'Eco-Tourism Trekking',
        url: 'https://www.nechabest.com/eco-tourism',
      },
    },
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Nature and Cultural Tours',
        serviceType: 'Eco-Tourism Tour',
        url: 'https://www.nechabest.com/eco-tourism',
      },
    },
  ],
  sameAs: [
    'https://www.instagram.com/nechabest/',
    'https://www.facebook.com/people/Nechabest-Sustainable-Initiatives/61576490034369/',
    'https://x.com/nechabest',
    'https://www.tiktok.com/@nechabest',
  ],
};

export default function EcoTourismLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}