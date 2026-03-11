import React from "react";
import { format, parseISO } from "date-fns";
import { getTeamColor } from "../utils";

export default function TopMissedGames({ memberStats, gameMap }) {
  // For each member, show their top-ranked games they missed
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-5">
      <h4
        className="mb-1 text-base font-semibold text-[var(--gold)]"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
      >
        Top Missed Picks
      </h4>
      <p className="mb-4 text-xs text-white/40">Highest-ranked games each member wanted but didn't get</p>

      <div className="space-y-4">
        {memberStats.map((m) => {
          const topMissed = m.missedFromRank.slice(0, 5);
          if (topMissed.length === 0) return null;
          return (
            <div key={m.name}>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: m.accent_color }} />
                <span
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
                >
                  {m.name}
                </span>
                <span className="text-[11px] text-white/30">{topMissed.length} top missed</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topMissed.map((item) => {
                  const g = gameMap[item.game_number];
                  if (!g) return null;
                  const teamColor = getTeamColor(g.opponent);
                  return (
                    <span
                      key={item.game_number}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs"
                    >
                      <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ background: teamColor }} />
                      <span className="text-white/70">{g.opponent}</span>
                      <span className="text-white/30">{format(parseISO(g.date), "MMM d")}</span>
                      <span className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px] font-mono text-white/40">
                        Rank #{item.rank}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}