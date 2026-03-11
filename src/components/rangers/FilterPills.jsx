import React from "react";

export default function FilterPills({ label, options, activeValue, onChange }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = activeValue === option;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition ${active ? "bg-[var(--navy)] text-white" : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}