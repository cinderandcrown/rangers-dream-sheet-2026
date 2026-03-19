import React from "react";
import { parseISO, format, differenceInCalendarDays } from "date-fns";
import { CalendarPlus, MapPin } from "lucide-react";
import { getTeamLogoUrl } from "./teamLogos";
import { getTeamColor } from "./utils";
import { generateSingleGameIcs, downloadIcsFile } from "./icsGenerator";

export default function NextGameSpotlight({ memberGames, memberName, accentColor, onToast }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextGame = memberGames.find((g) => parseISO(g.date) >= today);

  if (!nextGame) {
    return (
      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[var(--slate)] px-6 py-8 text-center">
        <div className="text-[28px] mb-2">🏆</div>
        <div className="text-[16px] font-bold text-white/80" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
          Season Complete
        </div>
        <p className="text-[13px] text-white/40 mt-1">See you next year!</p>
      </div>
    );
  }

  const gameDate = parseISO(nextGame.date);
  const daysUntil = differenceInCalendarDays(gameDate, today);
  const logoUrl = getTeamLogoUrl(nextGame.opponent);
  const teamColor = getTeamColor(nextGame.opponent);

  let countdownLabel = null;
  if (daysUntil === 0) countdownLabel = "🔥 Game Day!";
  else if (daysUntil === 1) countdownLabel = "🔥 Tomorrow!";
  else if (daysUntil <= 7) countdownLabel = `In ${daysUntil} days`;

  const handleAddToCalendar = (e) => {
    e.stopPropagation();
    const ics = generateSingleGameIcs(nextGame, memberName);
    downloadIcsFile(ics, `rangers-next-game.ics`);
    if (onToast) onToast("Added to calendar!");
  };

  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border"
      style={{ borderColor: `${accentColor}25`, borderLeft: `5px solid ${accentColor}` }}
    >
      <div className="bg-white/[0.02] px-5 sm:px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-bold tracking-[2.5px] text-[var(--gold)]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
          >
            Up Next
          </span>
          {countdownLabel && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                fontFamily: "'Oswald', sans-serif",
                background: daysUntil <= 1 ? "rgba(192,17,31,0.15)" : "rgba(191,160,72,0.12)",
                color: daysUntil <= 1 ? "#C0111F" : "var(--gold)",
              }}
            >
              {countdownLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl overflow-hidden"
            style={{ backgroundColor: logoUrl ? "rgba(255,255,255,0.06)" : teamColor, border: `2px solid ${teamColor}40` }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={nextGame.opponent} className="h-[36px] w-[36px] object-contain" />
            ) : (
              <span className="text-[16px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {nextGame.opponent.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[18px] font-bold text-white"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
              ⚾ vs {nextGame.opponent}
            </div>
            <div className="text-[13px] text-white/50 mt-0.5">
              {format(gameDate, "EEEE, MMMM d")} · {nextGame.start_time}
            </div>
            <div className="text-[12px] text-white/30 mt-0.5">
              Globe Life Field — Arlington, TX
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center gap-1.5 rounded-lg border border-[rgba(191,160,72,0.2)] bg-[rgba(191,160,72,0.06)] px-3 py-2 text-[11px] font-semibold text-[var(--gold)] transition hover:bg-[rgba(191,160,72,0.12)]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            <CalendarPlus className="h-3.5 w-3.5" /> Add to Calendar
          </button>
          <a
            href="https://maps.google.com/?q=Globe+Life+Field+Arlington+TX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/50 transition hover:bg-white/[0.06] hover:text-white/70"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <MapPin className="h-3.5 w-3.5" /> Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}