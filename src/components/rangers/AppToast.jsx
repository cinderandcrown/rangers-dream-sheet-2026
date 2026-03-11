import React, { useEffect, useState } from "react";

export default function AppToast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) { setVisible(false); return; }
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 2400);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[1000] -translate-x-1/2 rounded-xl border border-[var(--gold)] bg-[var(--slate)] px-7 py-[14px] text-[15px] font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-transform duration-[400ms]"
      style={{
        fontFamily: "'Oswald', sans-serif",
        letterSpacing: "1px",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(100px)",
      }}
    >
      {toast}
    </div>
  );
}