import React from "react";

export default function BrandHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-4 border-[var(--red)] bg-[var(--navy)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[var(--red)] text-lg font-bold text-white shadow-lg oswald">
          TX
        </div>
        <div>
          <div className="text-xl font-semibold text-white oswald sm:text-2xl">Rangers Dream Sheet</div>
          <div className="text-sm font-semibold text-[var(--gold)] sm:text-base">2026 Season Ticket Selector</div>
        </div>
      </div>
    </header>
  );
}