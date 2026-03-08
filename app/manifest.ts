import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nechabest Sustainable Initiatives',
    short_name: 'Nechabest',
    description: 'Building a Sustainable Future for People and Nature in Uganda',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#2d5a27',
    icons: [
      {
        src: 'https://iili.io/ffrDkkN.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://iili.io/ffrDkkN.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['sustainability', 'eco-tourism', 'conservation'],
    orientation: 'portrait',
  };
}
