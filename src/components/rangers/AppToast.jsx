import React, { useEffect, useState } from "react";

export default function AppToast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) { setVisible(false); return; }
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[1000] flex items-center gap-2.5 rounded-xl border border-white/[0.08] px-6 py-3.5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all duration-300"
      style={{
        fontFamily: "'Oswald', sans-serif",
        letterSpacing: "0.5px",
        fontSize: "14px",
        backgroundColor: "rgba(30,41,59,0.95)",
        backdropFilter: "blur(16px)",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(80px)",
        opacity: visible ? 1 : 0,
      }}
    >
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--gold)]" />
      <span className="text-white/90">{toast}</span>
    </div>
  );
}