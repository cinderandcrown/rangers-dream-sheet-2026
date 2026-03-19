import React from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { getTeamLogoUrl } from "./teamLogos";
import { getTeamColor } from "./utils";
import { generateSingleGameIcs, downloadIcsFile } from "./icsGenerator";

export default function MyGameCard({ game, memberName, onInfoClick }) {
  const logoUrl = getTeamLogoUrl(game.opponent);
  const teamColor = getTeamColor(game.opponent);
  const d = parseISO(game.date);
  const dateLabel = format(d, "EEE, MMM d");
  const isWeekend = ["Fri", "Sat", "Sun"].includes(game.day_of_week);

  const handleAddToCalendar = (e) => {
    e.stopPropagation();
    const ics = generateSingleGameIcs(game, memberName);
    downloadIcsFile(ics, `rangers-vs-${game.opponent.toLowerCase().replace(/\s+/g, "-")}-${format(d, "MMM-d")}.ics`);
  };

  const tags = [];
  if (game.is_holiday) tags.push({ label: game.is_holiday, color: "#EAB308", bg: "rgba(234,179,8,0.15)" });
  if (game.promotional_event) tags.push({ label: game.promotional_event, color: "#60A5FA", bg: "rgba(96,165,250,0.12)" });
  if (game.is_day_game) tags.push({ label: "Day Game", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" });

  return (
    <div
      className="group relative flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[var(--slate)] p-3 sm:p-4 transition-all hover:border-white/[0.12] cursor-pointer"
      onClick={() => onInfoClick && onInfoClick(game)}
    >
      {/* Team logo */}
      <div
        className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[10px] overflow-hidden"
        style={{ backgroundColor: logoUrl ? "rgba(255,255,255,0.06)" : teamColor }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={game.opponent} className="h-[32px] w-[32px] object-contain" />
        ) : (
          <span className="text-[14px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            {game.opponent.slice(0, 3).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="truncate text-[14px] sm:text-[15px] font-semibold text-white"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            vs {game.opponent}
          </span>
          {isWeekend && (
            <span
              className="inline-block rounded px-[5px] py-[1px] text-[9px] font-semibold text-[var(--gold)]"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", background: "rgba(191,160,72,0.15)" }}
            >
              WKND
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[12px] text-white/45">
          {dateLabel} · {game.start_time} CT
        </div>
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t.label} className="inline-block rounded-md px-[5px] py-[1px] text-[9px] font-semibold" style={{ color: t.color, backgroundColor: t.bg }}>
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add to Calendar */}
      <button
        onClick={handleAddToCalendar}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/40 transition hover:bg-[rgba(191,160,72,0.15)] hover:text-[var(--gold)]"
        title="Add to Calendar"
      >
        <CalendarPlus className="h-4 w-4" />
      </button>
    </div>
  );
}