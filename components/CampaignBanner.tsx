'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { WhatsAppLogoIcon } from '@/components/FloatingWhatsApp';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaLabel: string;
  ctaType: 'link' | 'whatsapp';
  ctaLink: string;
  whatsappMessage: string;
  showOnOpen: boolean;
}

const SESSION_KEY = 'nechabest-campaign-banner-seen';

export default function CampaignBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState<Banner | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/banners', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Banner[];
        if (cancelled) return;

        setBanners(data);
        const onOpenBanner = data.find((b) => b.showOnOpen) || data[0];
        setCurrent(onOpenBanner || null);

        if (onOpenBanner) {
          const alreadySeen = sessionStorage.getItem(SESSION_KEY);
          if (!alreadySeen) {
            // Slight delay so the page paints first — feels premium, not jarring.
            const t = setTimeout(() => setVisible(true), 1200);
            sessionStorage.setItem(SESSION_KEY, '1');
            return () => clearTimeout(t);
          }
        }
      } catch (error) {
        console.error('Error loading campaign banners:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => setVisible(false);

  const open = (banner: Banner) => {
    close();
    if (banner.ctaType === 'whatsapp') {
      const message =
        banner.whatsappMessage ||
        `Hello Nechabest Adventures! I am interested in "${banner.title}". Please share more details.`;
      window.open(buildWhatsAppLink(message), '_blank', 'noopener,noreferrer');
    } else if (banner.ctaLink) {
      window.open(banner.ctaLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Campaign announcement"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] border border-white/10"
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close announcement"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-24 bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-nature" />
              </div>
            ) : (
              <>
                {/* Poster */}
                {current.image && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={current.image}
                      alt={current.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {current.subtitle && (
                      <div className="absolute bottom-3 left-4 right-4">
                        <span className="inline-block bg-nature text-black text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                          {current.subtitle}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Body */}
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-extrabold text-black leading-tight">
                    {current.title}
                  </h3>
                  {current.description && (
                    <p className="mt-2 text-sm text-black/60 leading-relaxed">
                      {current.description}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="mt-6 flex items-center gap-3">
                    {current.ctaType === 'whatsapp' ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => open(current)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb959] text-white font-bold py-3.5 rounded-xl shadow-[0_10px_25px_rgba(37,211,102,0.4)] transition-colors"
                      >
                        <WhatsAppLogoIcon className="w-5 h-5" />
                        {current.ctaLabel || 'Book Now on WhatsApp'}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => open(current)}
                        className="flex-1 flex items-center justify-center gap-2 bg-nature hover:bg-nature/90 text-black font-bold py-3.5 rounded-xl shadow transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                        {current.ctaLabel || 'Learn More'}
                      </motion.button>
                    )}
                    <button
                      onClick={close}
                      className="text-sm font-semibold text-black/45 hover:text-black underline underline-offset-4"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}