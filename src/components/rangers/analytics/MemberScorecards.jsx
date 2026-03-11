import React from "react";

function Ring({ pct, color, size = 52 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#E2E8F0"
        fontSize={13}
        fontWeight={700}
        fontFamily="'Oswald', sans-serif"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>{value}</div>
      <div className="text-[10px] text-white/35 uppercase" style={{ letterSpacing: "0.5px" }}>{label}</div>
    </div>
  );
}

export default function MemberScorecards({ memberStats }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {memberStats.map((m) => (
        <div
          key={m.name}
          className="rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-5"
          style={{ borderTop: `3px solid ${m.accent_color}` }}
        >
          <div className="mb-4 flex items-center gap-4">
            <Ring pct={m.rankHitRate} color={m.accent_color} />
            <div>
              <div
                className="text-base font-bold text-white"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                {m.name}
              </div>
              <div className="text-xs text-white/40">
                {m.gotFromRank.length} of {m.totalRanked} ranked secured
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Stat label="Top 5" value={`${m.top5Hits}/${m.top5Total}`} />
            <Stat label="Top 10" value={`${m.top10Hits}/${m.top10Total}`} />
            <Stat label="Unranked" value={m.unrankedCount} />
            <Stat label="Total" value={m.totalAllocated} />
          </div>
        </div>
      ))}
    </div>
  );
}