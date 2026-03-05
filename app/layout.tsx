import type { Metadata } from 'next';
import { Inter, Alfa_Slab_One } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const display = Alfa_Slab_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Nechabest Sustainable Initiatives',
  description: 'Building a Sustainable Future for People and Nature in Uganda.',
  icons: {
    icon: 'https://iili.io/ffrDkkN.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
