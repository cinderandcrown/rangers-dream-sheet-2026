import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function AppToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 2400);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2"
        >
          <div className="rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-r from-[rgba(30,41,59,0.97)] to-[rgba(20,30,48,0.97)] px-5 py-3.5 shadow-2xl shadow-black/40 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--gold)]/15">
                <span className="text-base">✓</span>
              </div>
              <span className="text-sm font-semibold text-white/90">{toast}</span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}