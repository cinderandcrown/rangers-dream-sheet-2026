import React from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { getTeamLogoUrl } from "./teamLogos";
import { getTeamColor, getTeamAbbreviation } from "./utils";
import { generateSingleGameIcs, downloadIcsFile } from "./icsGenerator";

export default function MyGameCard({ game, memberName, onInfoClick, index, allocation }) {
  const isPersonal = allocation?.ticket_type === "personal";
  const sectionNote = allocation?.section_note || "";
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
      className="group relative flex items-center gap-3 rounded-xl border p-3 sm:p-4 transition-all hover:border-white/[0.15] hover:bg-white/[0.04] cursor-pointer"
      style={{
        borderColor: isPersonal ? "rgba(191,160,72,0.2)" : "rgba(255,255,255,0.06)",
        background: isPersonal ? "rgba(191,160,72,0.04)" : "rgba(255,255,255,0.02)",
      }}
      onClick={() => onInfoClick && onInfoClick(game)}
    >
      {/* Game number badge */}
      <div className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[9px] font-bold text-white/40" style={{ fontFamily: "'Oswald', sans-serif" }}>
        {game.game_number}
      </div>

      {/* Team logo with accent border */}
      <div
        className="flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center rounded-[12px] overflow-hidden"
        style={{
          backgroundColor: logoUrl ? "rgba(255,255,255,0.06)" : teamColor,
          border: `2px solid ${teamColor}40`,
        }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={game.opponent} className="h-[34px] w-[34px] object-contain" />
        ) : (
          <span className="text-[14px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            {getTeamAbbreviation(game.opponent)}
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
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/45">
          <span>{dateLabel}</span>
          <span className="text-white/20">·</span>
          <span>{game.start_time} CT</span>
          <span className="text-white/20">·</span>
          <span>{game.start_time_et} ET</span>
        </div>
        {(tags.length > 0 || isPersonal) && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {isPersonal && (
              <span className="inline-block rounded-md px-[6px] py-[2px] text-[9px] font-semibold" style={{ color: "#BFA048", backgroundColor: "rgba(191,160,72,0.2)", fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Personal {sectionNote ? `· ${sectionNote}` : ""}
              </span>
            )}
            {tags.map((t) => (
              <span key={t.label} className="inline-block rounded-md px-[6px] py-[2px] text-[9px] font-semibold" style={{ color: t.color, backgroundColor: t.bg }}>
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add to Calendar button */}
      <button
        onClick={handleAddToCalendar}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/35 transition hover:bg-[rgba(191,160,72,0.15)] hover:text-[var(--gold)] hover:scale-105 active:scale-95"
        title="Add to Calendar"
      >
        <CalendarPlus className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}