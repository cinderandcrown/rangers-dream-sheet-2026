import React from "react";

export default function MemberCard({ member, hasSubmitted, rankedCount, isLocked, onClick }) {
  const progressPercent = member.rank_max ? Math.min(Math.round((rankedCount / member.rank_max) * 100), 100) : 0;

  return (
    <div
      onClick={onClick}
      className="member-card group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:border-white/[0.12] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      style={{ backgroundColor: "rgba(30,41,59,0.7)", backdropFilter: "blur(12px)" }}
    >
      {/* Top accent bar — always visible, uses member color */}
      <div
        className="h-[3px] w-full transition-all duration-300 group-hover:h-[4px]"
        style={{
          background: hasSubmitted
            ? `linear-gradient(90deg, ${member.accent_color}, #22C55E)`
            : `linear-gradient(90deg, ${member.accent_color}80, ${member.accent_color})`
        }}
      />

      <div className="px-4 pb-5 pt-5 text-center sm:px-5">
        {/* Avatar with status ring */}
        <div className="relative mx-auto mb-3 h-[60px] w-[60px]">
          <div
            className="flex h-full w-full items-center justify-center rounded-full text-[22px] font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
            style={{
              fontFamily: "'Oswald', sans-serif",
              background: `linear-gradient(135deg, ${member.accent_color}, ${member.accent_color}CC)`,
              border: hasSubmitted ? "3px solid #22C55E" : "3px solid rgba(255,255,255,0.12)"
            }}
          >
            {member.name[0]}
          </div>
          {/* Status badge */}
          <div className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5">
            {isLocked && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--slate)] text-[9px] shadow-md">
                🔒
              </span>
            )}
            {hasSubmitted && !isLocked && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] shadow-md">
                ✓
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <div
          className="mb-0.5 text-[17px] font-semibold leading-tight text-white"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          {member.name}
        </div>

        {/* Share count */}
        <div className="mb-3 text-[12px] text-white/35">
          {member.share_count} games
        </div>

        {/* Progress bar */}
        <div className="h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100
                ? "linear-gradient(90deg, #22C55E, #16A34A)"
                : progressPercent > 0
                ? `linear-gradient(90deg, ${member.accent_color}, var(--gold))`
                : "transparent"
            }}
          />
        </div>
        <div className="mt-1.5 text-[11px] text-white/30">
          {rankedCount > 0 ? `${rankedCount}/${member.rank_max} ranked` : "Not started"}
        </div>
      </div>
    </div>
  );
}