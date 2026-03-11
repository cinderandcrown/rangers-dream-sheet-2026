import React from "react";
import { RESERVED_GAME_NUMBER } from "./constants";
import { formatGameMeta, getTeamAbbreviation, getTeamColor } from "./utils";

export default function GameCard({ game, rankNumber, onSelect, maxReached }) {
  const isReserved = game.game_number === RESERVED_GAME_NUMBER;
  const isRanked = Boolean(rankNumber);
  const teamColor = getTeamColor(game.opponent);

  return (
    <button
      disabled={isReserved || isRanked}
      onClick={() => onSelect(game)}
      className={`relative min-h-[152px] rounded-2xl border p-4 text-left transition ${
        isReserved
          ? "border-[rgba(191,160,72,0.4)] bg-[rgba(191,160,72,0.08)] opacity-55"
          : isRanked
            ? "cursor-not-allowed border-white/10 bg-[var(--slate)] opacity-35"
            : "border-white/10 bg-[var(--slate)] hover:-translate-y-1 hover:border-white/20 hover:shadow-xl"
      }`}
      style={isReserved ? { borderStyle: "dashed" } : undefined}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl text-xs font-bold text-white oswald" style={{ backgroundColor: teamColor }}>
          {getTeamAbbreviation(game.opponent)}
        </div>
        {isReserved ? (
          <div className="rounded-full border border-[var(--gold)]/30 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)] oswald">Opening Day</div>
        ) : null}
        {isRanked ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold)] text-sm font-bold text-[var(--dark)] oswald">{rankNumber}</div>
        ) : null}
      </div>
      <div className="text-xl text-white oswald">{game.opponent}</div>
      <div className="mt-2 text-sm text-white/70">#{game.game_number} · {formatGameMeta(game)}</div>
      <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">
        {isReserved ? "Reserved from draft" : maxReached ? "Tap to rank" : "Available game"}
      </div>
    </button>
  );
}