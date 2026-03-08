'use client';

import { useEffect, useMemo, useState } from 'react';

export function useSiteContent(page: string) {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const [globalRes, pageRes] = await Promise.all([
          fetch('/api/site-content?page=global', { cache: 'no-store' }),
          fetch(`/api/site-content?page=${encodeURIComponent(page)}`, { cache: 'no-store' }),
        ]);

        const globalContent = globalRes.ok ? ((await globalRes.json()) as Record<string, string>) : {};
        const pageContent = pageRes.ok ? ((await pageRes.json()) as Record<string, string>) : {};

        if (active) {
          setContent({ ...globalContent, ...pageContent });
        }
      } catch (error) {
        console.error('Failed to load site content:', error);
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, [page]);

  const get = useMemo(() => {
    return (key: string, fallback: string) => {
      const value = content[key];
      return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
    };
  }, [content]);

  return { content, get };
}
