import React from "react";
import { format, parseISO } from "date-fns";
import { X, MapPin, Clock, Calendar, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeamLogoUrl } from "./teamLogos";
import { getTeamColor } from "./utils";
import { RESERVED_GAME_NUMBER, STADIUM_LABEL } from "./constants";

export default function GameDetailModal({ game, allocation, members, onClose, onRequestSwap }) {
  if (!game) return null;

  const logoUrl = getTeamLogoUrl(game.opponent);
  const teamColor = getTeamColor(game.opponent);
  const d = parseISO(game.date);
  const fullDate = format(d, "EEEE, MMMM d, yyyy");
  const isReserved = game.game_number === RESERVED_GAME_NUMBER;
  const owner = isReserved ? "Reserved — Opening Day" : allocation?.assigned_to || "Unassigned";
  const ownerMember = members?.find((m) => m.name === owner);

  const tags = [];
  if (game.is_holiday) tags.push({ label: game.is_holiday, color: "#EAB308", bg: "rgba(234,179,8,0.15)" });
  if (game.promotional_event) tags.push({ label: game.promotional_event, color: "#60A5FA", bg: "rgba(96,165,250,0.12)" });
  if (game.is_day_game) tags.push({ label: "Day Game", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/[0.08]"
          style={{ background: "#1E293B" }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Color stripe */}
          <div className="h-[5px]" style={{ background: teamColor }} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Team header */}
          <div className="flex items-center gap-4 px-6 pt-6 pb-4">
            <div
              className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-xl overflow-hidden"
              style={{ backgroundColor: logoUrl ? "rgba(255,255,255,0.08)" : teamColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={game.opponent} className="h-[40px] w-[40px] object-contain" />
              ) : (
                <span className="text-[18px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {game.opponent.slice(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2
                className="text-[20px] font-bold text-white"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                vs {game.opponent}
              </h2>
              <p className="text-[13px] text-white/50">Game #{game.game_number}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 px-6 pb-4">
            <div className="flex items-center gap-3 text-[14px]">
              <Calendar className="h-4 w-4 flex-shrink-0 text-white/40" />
              <span className="text-white/90">{fullDate}</span>
            </div>
            <div className="flex items-center gap-3 text-[14px]">
              <Clock className="h-4 w-4 flex-shrink-0 text-white/40" />
              <span className="text-white/90">{game.start_time} CT / {game.start_time_et} ET</span>
            </div>
            <div className="flex items-center gap-3 text-[14px]">
              <MapPin className="h-4 w-4 flex-shrink-0 text-white/40" />
              <span className="text-white/90">{game.location || STADIUM_LABEL}</span>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-6 pb-4">
              {tags.map((t) => (
                <span
                  key={t.label}
                  className="inline-block rounded-md px-2 py-[3px] text-[11px] font-semibold"
                  style={{ color: t.color, backgroundColor: t.bg }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          )}

          {/* Owner section */}
          <div
            className="mx-6 mb-5 rounded-xl border border-white/[0.06] px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="text-[10px] font-semibold text-white/40 mb-1.5" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
              Ticket Owner
            </div>
            <div className="flex items-center gap-2.5">
              {ownerMember ? (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ background: ownerMember.accent_color }}
                >
                  {ownerMember.name[0]}
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] text-white/50">
                  ?
                </div>
              )}
              <span className="text-[15px] font-semibold text-white">{owner}</span>
              {allocation?.was_ranked && (
                <span className="ml-auto rounded-md bg-[rgba(191,160,72,0.15)] px-2 py-[2px] text-[10px] font-semibold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Ranked #{allocation.rank_position}
                </span>
              )}
            </div>
          </div>

          {/* Request Swap button */}
          {allocation && !isReserved && onRequestSwap && (
            <div className="px-6 pb-6">
              <button
                onClick={() => onRequestSwap(game, allocation)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] py-3 text-[13px] font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                <ArrowLeftRight className="h-4 w-4" />
                Request Swap
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}