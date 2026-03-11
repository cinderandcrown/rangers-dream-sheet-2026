import React from "react";

export default function MemberCard({ member, hasSubmitted, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative min-h-[170px] rounded-2xl border border-white/10 bg-[var(--slate)] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
    >
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-40 transition group-hover:opacity-100"
        style={{ backgroundColor: member.accent_color }}
      />
      <div className="absolute right-4 top-4 h-3.5 w-3.5 rounded-full" style={{ backgroundColor: hasSubmitted ? "#22C55E" : "#EAB308" }} />
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg oswald" style={{ backgroundColor: member.accent_color }}>
        {member.name.slice(0, 1)}
      </div>
      <div className="text-2xl text-white oswald">{member.name}</div>
      <div className="mt-2 text-sm text-white/70">{member.share_count} games · Rank top {member.rank_max}</div>
    </button>
  );
}