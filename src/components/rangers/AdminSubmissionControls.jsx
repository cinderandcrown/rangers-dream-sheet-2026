import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminSubmissionControls({ member, submission, onToast }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Submission.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Submission.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      onToast(`${member.name}'s submission deleted`);
    },
  });

  if (!submission) {
    return (
      <div className="rounded-[14px] border border-white/[0.06] p-5 text-center" style={{ backgroundColor: "#1E293B" }}>
        <div className="mb-1.5 text-base font-semibold" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", color: member.accent_color }}>
          {member.name}
        </div>
        <div className="mb-3 text-xs text-white/40">{member.share_count} game share · Rank {member.rank_max}</div>
        <span className="inline-block rounded-[20px] bg-[rgba(234,179,8,0.15)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#EAB308]">
          Awaiting
        </span>
      </div>
    );
  }

  const ct = submission.ranked_game_ids?.length || 0;
  const isLocked = submission.is_locked;
  const isFinal = submission.is_final;

  return (
    <div className="rounded-[14px] border border-white/[0.06] p-5 text-center" style={{ backgroundColor: "#1E293B" }}>
      <div className="mb-1.5 text-base font-semibold" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", color: member.accent_color }}>
        {member.name}
      </div>
      <div className="mb-1 text-xs text-white/40">{member.share_count} game share · Rank {member.rank_max}</div>
      {submission.member_email && (
        <div className="mb-2 text-[11px] text-white/30">{submission.member_email}</div>
      )}
      <span className={`mb-3 inline-block rounded-[20px] px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
        isFinal ? "bg-[rgba(96,165,250,0.15)] text-[#60A5FA]" :
        ct > 0 ? "bg-[rgba(34,197,94,0.15)] text-[#22C55E]" :
        "bg-[rgba(234,179,8,0.15)] text-[#EAB308]"
      }`}>
        {isFinal ? `✓ Finalized (${ct})` : ct > 0 ? `✓ ${ct} ranked` : "Awaiting"}
      </span>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        <button
          onClick={() => updateMutation.mutate({ id: submission.id, data: { is_locked: !isLocked } })}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition ${
            isLocked
              ? "border border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.1)] text-[#EAB308]"
              : "border border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
          }`}
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {isLocked ? "🔒 Locked" : "🔓 Lock"}
        </button>
        <button
          onClick={() => updateMutation.mutate({ id: submission.id, data: { is_final: !isFinal } })}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition ${
            isFinal
              ? "border border-[rgba(96,165,250,0.3)] bg-[rgba(96,165,250,0.1)] text-[#60A5FA]"
              : "border border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
          }`}
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {isFinal ? "★ Final" : "☆ Finalize"}
        </button>
        <button
          onClick={() => {
            if (window.confirm(`Delete ${member.name}'s submission?`)) {
              deleteMutation.mutate(submission.id);
            }
          }}
          className="rounded-md border border-[rgba(192,17,31,0.2)] bg-[rgba(192,17,31,0.08)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--red)] transition hover:bg-[rgba(192,17,31,0.2)]"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          ✕ Delete
        </button>
      </div>
    </div>
  );
}