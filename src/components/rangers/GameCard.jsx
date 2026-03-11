import React from "react";
import { motion } from "framer-motion";
import { RESERVED_GAME_NUMBER } from "./constants";
import { formatGameMeta, getTeamAbbreviation, getTeamColor } from "./utils";

export default function GameCard({ game, rankNumber, onSelect, maxReached }) {
  const isReserved = game.game_number === RESERVED_GAME_NUMBER;
  const isRanked = Boolean(rankNumber);
  const teamColor = getTeamColor(game.opponent);

  const cardContent = (
    <>
      {/* Team badge + rank/reserved indicator */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className="flex h-[44px] w-[44px] items-center justify-center rounded-xl text-[11px] font-bold tracking-wider text-white shadow-lg oswald"
          style={{
            background: `linear-gradient(135deg, ${teamColor}, ${teamColor}BB)`,
            boxShadow: `0 4px 12px ${teamColor}40`
          }}
        >
          {getTeamAbbreviation(game.opponent)}
        </div>
        {isReserved ? (
          <div className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] text-[var(--gold)] oswald">
            ⭐ Opening Day
          </div>
        ) : null}
        {isRanked ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gold)] to-[#8B7128] text-sm font-bold text-[var(--dark)] shadow-lg oswald">
            {rankNumber}
          </div>
        ) : null}
      </div>

      {/* Opponent name */}
      <div className="text-lg font-semibold text-white oswald">{game.opponent}</div>

      {/* Date/time line */}
      <div className="mt-1.5 text-[13px] leading-relaxed text-white/60">
        {formatGameMeta(game)}
      </div>

      {/* Bottom row: game number + day badge */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/30">#{game.game_number}</span>
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/50 oswald">
          {game.day_of_week}
        </span>
      </div>
    </>
  );

  if (isReserved) {
    return (
      <div className="relative rounded-2xl border border-dashed border-[rgba(191,160,72,0.35)] bg-[rgba(191,160,72,0.06)] p-4 opacity-60">
        {cardContent}
      </div>
    );
  }

  if (isRanked) {
    return (
      <div className="relative cursor-default rounded-2xl border border-white/5 bg-[var(--slate)]/50 p-4 opacity-35">
        {cardContent}
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => onSelect(game)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="glass-card relative rounded-2xl p-4 text-left"
    >
      {cardContent}
    </motion.button>
  );
}