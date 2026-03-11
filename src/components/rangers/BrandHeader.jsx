import React from "react";

export default function BrandHeader({ showBack, onBack }) {
  return (
    <header
      className="sticky top-0 z-[100]"
      style={{
        background: "linear-gradient(135deg, var(--navy), #001845)",
        borderBottom: "4px solid var(--red)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--gold)] bg-[var(--red)] text-[22px] font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            TX
          </div>
          <div>
            <h1
              className="text-[22px] font-bold leading-tight text-white"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}
            >
              Rangers Dream Sheet
            </h1>
            <div
              className="text-xs font-medium text-[var(--gold)]"
              style={{ letterSpacing: "3px", textTransform: "uppercase" }}
            >
              2026 Season Ticket Selector
            </div>
          </div>
        </div>
        {showBack ? (
          <button
            onClick={onBack}
            className="rounded-md border border-white/15 bg-transparent px-4 py-2 text-[13px] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}
          >
            ← Back
          </button>
        ) : null}
      </div>
    </header>
  );
}