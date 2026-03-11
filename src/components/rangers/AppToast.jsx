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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl border border-[rgba(191,160,72,0.65)] bg-[#1E293B] px-4 py-3 text-sm font-semibold text-white shadow-2xl"
        >
          {toast}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}