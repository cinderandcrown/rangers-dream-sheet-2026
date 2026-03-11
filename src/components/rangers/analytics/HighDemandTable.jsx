import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { getTeamColor, getTeamAbbreviation } from "../utils";

export default function HighDemandTable({ highDemandGames }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? highDemandGames : highDemandGames.slice(0, 12);

  if (highDemandGames.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-6 text-center text-sm text-white/40">
        No high-demand games found (games ranked by 2+ members).
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--slate)] overflow-hidden">
      <div className="p-5 pb-3">
        <h4
          className="mb-1 text-base font-semibold text-[var(--gold)]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          High-Demand Games
        </h4>
        <p className="text-xs text-white/40">Games ranked by multiple members — showing who won and who missed out</p>
      </div>
      <div className="overflow-x-auto thin-scrollbar">
        <table className="at w-full">
          <thead>
            <tr>
              <th>Game</th>
              <th>Date</th>
              <th>Opponent</th>
              <th className="text-center">Demand</th>
              <th>Won By</th>
              <th>Missed By</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              const g = item.game;
              if (!g) return null;
              const teamColor = getTeamColor(g.opponent);
              return (
                <tr key={item.game_number}>
                  <td className="font-mono text-xs text-white/50">#{g.game_number}</td>
                  <td className="text-sm whitespace-nowrap">
                    {format(parseISO(g.date), "EEE, MMM d")}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ background: teamColor }}
                      />
                      <span className="text-sm">{g.opponent}</span>
                      {g.is_holiday && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)]">
                          {g.is_holiday}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                      {item.demandCount}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: item.rankers.find((r) => r.name === item.winner)?.color || "#fff" }}
                      />
                      <span className="text-sm font-medium text-white">{item.winner}</span>
                      {item.winnerRank && (
                        <span className="text-[10px] text-white/30">#{item.winnerRank}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {item.missedBy.map((r) => (
                        <span
                          key={r.name}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                          style={{ background: `${r.color}22`, color: r.color, border: `1px solid ${r.color}33` }}
                        >
                          {r.name}
                          <span className="opacity-60">#{r.rank}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {highDemandGames.length > 12 && (
        <div className="p-3 text-center border-t border-white/[0.04]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-[var(--gold)] hover:text-white transition"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            {showAll ? "Show Less" : `Show All ${highDemandGames.length} Games`}
          </button>
        </div>
      )}
    </div>
  );
}