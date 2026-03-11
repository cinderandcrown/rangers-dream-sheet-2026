import React from "react";

export default function FilterPills({ options, activeValue, onChange }) {
  return (
    <>
      {options.map((option) => {
        const active = activeValue === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-lg px-[14px] py-1.5 text-[13px] font-medium transition-all ${
              active
                ? "border border-[var(--navy)] bg-[var(--navy)] text-white"
                : "border border-white/10 bg-transparent text-white/50 hover:border-white/20 hover:text-white"
            }`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {option}
          </button>
        );
      })}
    </>
  );
}