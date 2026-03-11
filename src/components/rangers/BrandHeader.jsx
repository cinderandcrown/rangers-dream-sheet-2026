import React from "react";

export default function BrandHeader({ showBack, onBack }) {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-[var(--red)] bg-[rgba(0,50,120,0.92)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        {showBack ? (
          <button
            onClick={onBack}
            className="mr-1 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        ) : null}
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[var(--red)] shadow-lg shadow-red-900/30">
          <span className="text-base font-bold text-white oswald" style={{ letterSpacing: "0.04em" }}>TX</span>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-white oswald sm:text-xl">Rangers Dream Sheet</span>
            <span className="hidden text-xs text-[var(--gold)]/80 sm:inline">·</span>
            <span className="hidden text-xs font-medium text-[var(--gold)]/80 sm:inline">2026 Season Ticket Selector</span>
          </div>
          <div className="text-xs font-medium text-[var(--gold)] sm:hidden">2026 Season</div>
        </div>
        <div className="hidden items-center gap-1 rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-3 py-1.5 sm:flex">
          <span className="text-xs">⚾</span>
          <span className="text-xs font-semibold text-[var(--gold)]">81 Home Games</span>
        </div>
      </div>
    </header>
  );
}