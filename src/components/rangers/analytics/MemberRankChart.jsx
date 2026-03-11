import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function MemberRankChart({ memberStats }) {
  const data = memberStats.map((m) => ({
    name: m.name,
    "Top 5 Secured": m.top5Hits,
    "Top 10 Secured": m.top10Hits,
    "Total Ranked Secured": m.gotFromRank.length,
    "Missed Ranked": m.missedFromRank.length,
    fill: m.accent_color,
  }));

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-5">
      <h4
        className="mb-1 text-base font-semibold text-[var(--gold)]"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
      >
        Ranked Preferences Secured
      </h4>
      <p className="mb-5 text-xs text-white/40">How many of each member's ranked games they actually received</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'Oswald', sans-serif" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "#0F172A",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                fontSize: 13,
                color: "#E2E8F0",
              }}
            />
            <Bar dataKey="Total Ranked Secured" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
              ))}
            </Bar>
            <Bar dataKey="Missed Ranked" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} fillOpacity={0.25} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}