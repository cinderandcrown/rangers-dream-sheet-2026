import React from "react";

export default function BrandHeader({ showBack, onBack }) {
  return (
    <header
      className="sticky top-0 z-[100]"
      style={{
        background: "linear-gradient(135deg, var(--navy), #001845)",
        borderBottom: "3px solid var(--red)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03) inset"
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-3.5">
          {/* Logo mark */}
          <div className="relative">
            <div
              className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border-[2.5px] border-[var(--gold)] bg-[var(--red)] text-[20px] font-bold text-white shadow-[0_4px_12px_rgba(192,17,31,0.3)]"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              TX
            </div>
          </div>
          <div>
            <h1
              className="text-[20px] font-bold leading-tight text-white"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}
            >
              Rangers Dream Sheet
            </h1>
            <div
              className="text-[10px] font-medium text-[var(--gold)]"
              style={{ letterSpacing: "3px", textTransform: "uppercase", opacity: 0.8 }}
            >
              2026 Season Ticket Selector
            </div>
          </div>
        </div>
        {showBack && (
          <button
            onClick={onBack}
            className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}
          >
            ← Back
          </button>
        )}
      </div>
    </header>
  );
}