import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit, getClientIdentifier, secureJson } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

// Public read-only endpoint — returns only active banners, ordered by `order`.
export async function GET(request: NextRequest) {
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`banners:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const db = await getDb();
    const banners = await db
      .collection('banners')
      .find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return secureJson(
      banners.map((banner) => ({
        id: banner._id.toString(),
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        image: banner.image,
        ctaLabel: banner.ctaLabel,
        ctaType: banner.ctaType,
        ctaLink: banner.ctaLink,
        whatsappMessage: banner.whatsappMessage,
        showOnOpen: Boolean(banner.showOnOpen),
      }))
    );
  } catch (error) {
    console.error('Error fetching banners:', error instanceof Error ? error.message : 'unknown');
    return secureJson([], { status: 200 });
  }
}