import React from "react";
import { RESERVED_GAME_NUMBER } from "./constants";
import { getTeamColor } from "./utils";
import { format, parseISO } from "date-fns";

export default function GameCard({ game, rankNumber, onSelect }) {
  const isReserved = game.game_number === RESERVED_GAME_NUMBER;
  const isRanked = Boolean(rankNumber);
  const teamColor = getTeamColor(game.opponent);
  const abbr = game.opponent.slice(0, 3).toUpperCase();
  const dateLabel = format(parseISO(game.date), "MMM d");

  return (
    <div
      onClick={() => !isRanked && !isReserved && onSelect(game)}
      className={`relative flex items-center gap-[14px] rounded-xl border p-[14px_16px] transition-all duration-200 ${
        isReserved
          ? "cursor-default border-dashed border-[rgba(191,160,72,0.4)] bg-[rgba(191,160,72,0.05)] opacity-55"
          : isRanked
            ? "cursor-default border-transparent bg-[var(--slate)] opacity-35"
            : "cursor-pointer border-white/[0.06] bg-[var(--slate)] hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
      }`}
    >
      {/* Rank badge */}
      {isRanked ? (
        <div
          className="absolute -right-[6px] -top-[6px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--gold)] text-[13px] font-bold text-[var(--dark)] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {rankNumber}
        </div>
      ) : null}

      {/* Reserved tag */}
      {isReserved ? (
        <div
          className="absolute right-[10px] top-2 text-[10px] text-[var(--gold)] opacity-80"
          style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}
        >
          Opening Day
        </div>
      ) : null}

      {/* Team color badge */}
      <div
        className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] text-[14px] font-semibold text-white"
        style={{ fontFamily: "'Oswald', sans-serif", backgroundColor: teamColor }}
      >
        {abbr}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[15px] font-medium"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          {game.opponent}{isReserved ? " ★" : ""}
        </div>
        <div className="mt-0.5 text-[12.5px] text-white/45">
          {game.day_of_week}, {dateLabel} · {game.start_time}
        </div>
      </div>
    </div>
  );
}