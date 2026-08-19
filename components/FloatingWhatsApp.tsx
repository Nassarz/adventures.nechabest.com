'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { buildWhatsAppLink, defaultWhatsAppMessage } from '@/lib/whatsapp';

export function WhatsAppLogoIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.04 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.72 6.4L3.2 28.8l6.56-1.72a12.72 12.72 0 0 0 6.27 1.62h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.05-3.65Zm0 23.39h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.9 1.02 1.04-3.8-.25-.4a10.55 10.55 0 0 1-1.62-5.64c0-5.86 4.77-10.62 10.64-10.62 2.84 0 5.5 1.1 7.51 3.11a10.55 10.55 0 0 1 3.11 7.51c0 5.86-4.77 10.53-10.73 10.53Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.29.16.21 2.25 3.44 5.45 4.82.76.33 1.36.53 1.82.67.77.25 1.46.21 2.01.13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip briefly on first load
    const t = setTimeout(() => setShowTooltip(true), 2500);
    const hide = setTimeout(() => setShowTooltip(false), 9000);
    return () => {
      clearTimeout(t);
      clearTimeout(hide);
    };
  }, []);

  const href = buildWhatsAppLink(defaultWhatsAppMessage());

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-white text-primary rounded-2xl rounded-br-md px-4 py-3 shadow-2xl border border-black/5 max-w-[220px]">
              <p className="text-xs font-bold text-primary">Chat with us 👋</p>
              <p className="text-[11px] text-foreground/60 font-medium mt-0.5">
                Instant answers on tours & bookings
              </p>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              aria-label="Dismiss message"
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40 group-hover:opacity-60" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-20" />

        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Nechabest on WhatsApp"
          whileHover={{ scale: 1.1, rotate: 4 }}
          whileTap={{ scale: 0.92 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.4 }}
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_10px_35px_rgba(37,211,102,0.45)] border-2 border-white/20 hover:border-white/40"
        >
          <WhatsAppLogoIcon className="w-9 h-9 drop-shadow" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
        </motion.a>
      </div>
    </div>
  );
}