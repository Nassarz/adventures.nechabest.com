'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin routes
    if (pathname.startsWith('/admin')) return;

    const trackView = async () => {
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname,
            referrer: document.referrer || null,
          }),
        });
      } catch (error) {
        // Silently fail - tracking shouldn't break the user experience
        console.debug('View tracking failed:', error);
      }
    };

    // Track after a short delay to avoid tracking bounces
    const timeoutId = setTimeout(trackView, 1000);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null; // This component doesn't render anything
}
