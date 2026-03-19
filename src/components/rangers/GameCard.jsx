import React from "react";
import { Info } from "lucide-react";
import { RESERVED_GAME_NUMBER } from "./constants";
import { getTeamColor } from "./utils";
import { getTeamLogoUrl } from "./teamLogos";
import { format, parseISO } from "date-fns";

function GameTags({ game }) {
  const tags = [];
  if (game.is_holiday) tags.push({ label: game.is_holiday, color: "#EAB308", bg: "rgba(234,179,8,0.15)" });
  if (game.promotional_event) tags.push({ label: game.promotional_event, color: "#60A5FA", bg: "rgba(96,165,250,0.12)" });
  if (game.is_day_game) tags.push({ label: "Day Game", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" });
  if (tags.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t.label}
          className="inline-block rounded-md px-[6px] py-[1px] text-[10px] font-semibold"
          style={{ color: t.color, backgroundColor: t.bg }}
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}

export default function GameCard({ game, rankNumber, onSelect, onInfoClick }) {
  const isReserved = game.game_number === RESERVED_GAME_NUMBER;
  const isRanked = Boolean(rankNumber);
  const teamColor = getTeamColor(game.opponent);
  const logoUrl = getTeamLogoUrl(game.opponent);
  const abbr = game.opponent.slice(0, 3).toUpperCase();
  const dateLabel = format(parseISO(game.date), "MMM d");

  return (
    <div
      onClick={() => !isRanked && !isReserved && onSelect(game)}
      className={`game-card relative flex items-start gap-2 sm:gap-[14px] rounded-xl border p-[10px_12px] sm:p-[14px_16px] transition-all duration-200 ${
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

      {/* Team logo */}
      <div
        className="mt-0.5 flex h-[34px] w-[34px] sm:h-[42px] sm:w-[42px] flex-shrink-0 items-center justify-center rounded-[8px] sm:rounded-[10px] overflow-hidden"
        style={{ backgroundColor: logoUrl ? "rgba(255,255,255,0.06)" : teamColor }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={game.opponent}
            className="h-[26px] w-[26px] sm:h-[32px] sm:w-[32px] object-contain"
          />
        ) : (
          <span
            className="text-[14px] font-semibold text-white"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {abbr}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[13px] sm:text-[15px] font-medium"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          {game.opponent}{isReserved ? " ★" : ""}
        </div>
        <div className="mt-0.5 text-[11px] sm:text-[12.5px] text-white/45">
          {game.day_of_week}, {dateLabel} · {game.start_time}
        </div>
        {!isReserved ? <GameTags game={game} /> : null}
      </div>

      {/* Info button */}
      {onInfoClick && (
        <button
          onClick={(e) => { e.stopPropagation(); onInfoClick(game); }}
          className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-white/30 transition hover:bg-white/[0.12] hover:text-white/60"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}