import React from "react";
import { motion } from "framer-motion";

export default function MemberCard({ member, hasSubmitted, rankedCount, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="glass-card group relative flex min-h-[200px] flex-col rounded-2xl p-5 text-left"
    >
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl transition-all duration-300 group-hover:h-[4px]"
        style={{ backgroundColor: member.accent_color, opacity: 0.7 }}
      />

      {/* Status dot */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {hasSubmitted && rankedCount > 0 ? (
          <span className="rounded-full bg-[rgba(34,197,94,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
            {rankedCount} ranked
          </span>
        ) : null}
        <div
          className={`h-3 w-3 rounded-full shadow-lg status-dot-pulse`}
          style={{ backgroundColor: hasSubmitted ? "#22C55E" : "#EAB308" }}
        />
      </div>

      {/* Avatar */}
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-xl oswald"
        style={{
          background: `linear-gradient(135deg, ${member.accent_color}, ${member.accent_color}CC)`,
          boxShadow: `0 8px 24px ${member.accent_color}40`
        }}
      >
        {member.name.slice(0, 1)}
      </div>

      <div className="mt-auto">
        <div className="text-2xl text-white oswald">{member.name}</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/80">{member.share_count} games</span>
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/50">Rank top {member.rank_max}</span>
        </div>
      </div>

      {/* Hover shimmer */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.button>
  );
}