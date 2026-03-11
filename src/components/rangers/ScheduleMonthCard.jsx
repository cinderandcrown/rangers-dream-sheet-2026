import React from "react";
import { format, parseISO } from "date-fns";
import { getTeamColor } from "./utils";

export default function ScheduleMonthCard({ month, games }) {
  return (
    <div className="mb-4 overflow-hidden rounded-[14px] border border-white/[0.06] bg-[var(--slate)]">
      {/* Month header */}
      <div className="flex items-center justify-between bg-white/[0.03] px-5 py-3">
        <h3
          className="text-[15px] font-semibold text-white"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          ⚾ {month}
        </h3>
        <span className="text-[13px] text-white/50">
          {games.length} Game{games.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Game rows */}
      {games.map((game, i) => {
        const d = parseISO(game.date);
        const dateLabel = format(d, "EEE, MMM d");
        const isWeekend = ["Fri", "Sat", "Sun"].includes(game.day_of_week);
        const teamColor = getTeamColor(game.opponent);

        return (
          <div
            key={game.game_number}
            className="grid items-center border-t border-white/[0.04] px-5 py-[10px] text-[14px]"
            style={{
              gridTemplateColumns: "130px 1fr 90px 60px",
              background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : undefined,
            }}
          >
            <div className="text-white/80">{dateLabel}</div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: teamColor }}
              />
              <span className="text-white/90">vs {game.opponent}</span>
            </div>
            <div className="text-right text-white/60">{game.start_time}</div>
            <div className="text-right">
              {isWeekend && (
                <span
                  className="inline-block rounded px-[6px] py-[2px] text-[10px] font-semibold text-[var(--gold)]"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: "rgba(191,160,72,0.15)",
                  }}
                >
                  WKND
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}