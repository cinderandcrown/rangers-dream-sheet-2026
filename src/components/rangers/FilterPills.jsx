import React from "react";

export default function FilterPills({ options, activeValue, onChange, games, countKey }) {
  const counts = React.useMemo(() => {
    if (!games || !countKey) return {};
    const map = { All: games.length };
    games.forEach((g) => {
      const key = countKey === "month" ? g.month : g.day_of_week;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [games, countKey]);

  return (
    <>
      {options.map((option) => {
        const active = activeValue === option;
        const count = counts[option];
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            aria-label={`Filter by ${option}`}
            aria-pressed={active}
            className={`flex-shrink-0 rounded-lg px-[12px] sm:px-[14px] min-h-[44px] text-[11px] sm:text-[13px] font-medium transition-all ${
              active
                ? "border border-[var(--navy)] bg-[var(--navy)] text-white"
                : "border border-white/10 bg-transparent text-white/50 hover:border-white/20 hover:text-white"
            }`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {option}
            {count != null && (
              <span className={active ? "text-white/60 ml-1" : "text-white/30 ml-1"}>({count})</span>
            )}
          </button>
        );
      })}
    </>
  );
}