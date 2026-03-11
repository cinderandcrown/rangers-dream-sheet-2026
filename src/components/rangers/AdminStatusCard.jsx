import React from "react";

export default function AdminStatusCard({ member, submission }) {
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: member.accent_color, opacity: 0.6 }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white oswald"
          style={{ background: `linear-gradient(135deg, ${member.accent_color}, ${member.accent_color}BB)` }}
        >
          {member.name.slice(0, 1)}
        </div>
        <div
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            submission
              ? "bg-[rgba(34,197,94,0.12)] text-[#22C55E]"
              : "bg-[rgba(234,179,8,0.12)] text-[#EAB308]"
          }`}
        >
          {submission ? `✓ ${submission.ranked_game_ids.length} ranked` : "Awaiting"}
        </div>
      </div>
      <div className="mt-4 text-xl text-white oswald" style={{ color: member.accent_color }}>
        {member.name}
      </div>
      <div className="mt-1.5 text-xs text-white/45">
        {member.share_count} game share · Rank {member.rank_max}
      </div>
    </div>
  );
}