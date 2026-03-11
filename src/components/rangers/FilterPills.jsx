import React from "react";

export default function FilterPills({ label, options, activeValue, onChange }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = activeValue === option;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`min-h-[36px] rounded-lg px-3.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-[var(--navy)] text-white shadow-lg shadow-blue-900/20"
                  : "border border-white/8 bg-white/[0.03] text-white/55 hover:bg-white/[0.06] hover:text-white/80"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}