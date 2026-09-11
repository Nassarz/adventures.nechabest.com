import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Nechabest Sustainable Adventures | Adventure & Safari Tours in Uganda",
  description:
    "Discover Uganda with Nechabest Sustainable Adventures. Gorilla trekking, wildlife safaris, mountain hiking, and cultural immersion. Book your adventure today.",
  keywords: [
    "Uganda tours",
    "gorilla trekking",
    "safari Uganda",
    "Uganda adventure",
    "Nechabest",
    "sustainable adventures",
    "wildlife safari",
    "mountain hiking",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Nechabest Sustainable Adventures | Adventure & Safari Tours in Uganda",
    description:
      "Discover Uganda with Nechabest Sustainable Adventures. Gorilla trekking, wildlife safaris, mountain hiking, and cultural immersion.",
    url: "https://adventures.nechabest.com",
    siteName: "Nechabest Sustainable Adventures",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nechabest Sustainable Adventures | Adventure & Safari Tours in Uganda",
    description:
      "Discover Uganda with Nechabest Sustainable Adventures. Gorilla trekking, wildlife safaris, mountain hiking, and cultural immersion.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
