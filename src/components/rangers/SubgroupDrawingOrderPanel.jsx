import React from "react";

const SANDY_DRAWING_ORDER = [
  "Brad",
  "Shane",
  "Mary",
  "John P.",
  "JK",
  "Neal",
  "Chrissy",
  "Shane",
  "JK",
  "John R.",
  "Nick",
  "John P.",
  "Nick",
  "Andy",
  "JK",
  "Neal",
  "Shane",
  "Nick",
  "Brad",
  "Shane",
  "Shane",
  "John R.",
];

export default function SubgroupDrawingOrderPanel() {
  return (
    <div className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
        Sandy Drawing Order
      </div>
      <p className="mb-4 text-[12px] text-white/45">
        This follows the Word document order so Sandy can assign games manually in the same sequence.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {SANDY_DRAWING_ORDER.map((name, index) => (
          <div key={`${name}-${index + 1}`} className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-black/10 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-[12px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
              {index + 1}
            </div>
            <div className="text-[13px] font-semibold text-white">{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}