import React from "react";

export default function ScheduleStats({ games }) {
  const total = games.length;
  const weekend = games.filter((g) => ["Fri", "Sat", "Sun"].includes(g.day_of_week)).length;
  const weekday = total - weekend;

  const opponents = {};
  games.forEach((g) => {
    opponents[g.opponent] = (opponents[g.opponent] || 0) + 1;
  });
  const topOpponent = Object.entries(opponents).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const stats = [
    { num: total, label: "Total Games" },
    { num: weekend, label: "Weekend" },
    { num: weekday, label: "Weekday" },
    { num: topOpponent, label: "Top Opponent" },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-[10px] border border-white/[0.06] bg-[var(--slate)] p-4 text-center"
        >
          <div
            className="text-[22px] font-bold text-[var(--gold)]"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {s.num}
          </div>
          <div
            className="mt-1 text-[11px] text-white/40"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}