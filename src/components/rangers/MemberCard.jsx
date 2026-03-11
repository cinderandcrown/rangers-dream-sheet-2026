import React from "react";

export default function MemberCard({ member, hasSubmitted, rankedCount, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[14px] border-2 border-white/[0.06] bg-[var(--slate)] p-6 text-center transition-all duration-[250ms] hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
    >
      {/* Top accent bar - only shows on hover */}
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100"
        style={{ backgroundColor: member.accent_color }}
      />

      {/* Status dot */}
      <div
        className="absolute right-[14px] top-[14px] h-[10px] w-[10px] rounded-full"
        style={{
          backgroundColor: hasSubmitted ? "#22C55E" : "#EAB308",
          border: "2px solid var(--slate)"
        }}
      />

      {/* Avatar */}
      <div
        className="mx-auto mb-[14px] flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 border-white/15 text-2xl font-semibold text-white"
        style={{ fontFamily: "'Oswald', sans-serif", backgroundColor: member.accent_color }}
      >
        {member.name[0]}
      </div>

      {/* Name */}
      <div
        className="mb-1 text-lg font-semibold"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
      >
        {member.name}
      </div>

      {/* Share info */}
      <div className="text-[13px] text-white/45">
        {member.share_count} games · Rank top {member.rank_max}
      </div>
    </div>
  );
}