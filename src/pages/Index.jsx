import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import MemberCard from "@/components/rangers/MemberCard";
import EmailLoginModal from "@/components/rangers/EmailLoginModal";
import useSeedData from "@/components/rangers/useSeedData";
import { DEADLINE_LABEL } from "@/components/rangers/constants";
import { sortMembers } from "@/components/rangers/utils";

export default function Index() {
  const [toast, setToast] = React.useState("");
  const [loginMember, setLoginMember] = React.useState(null);
  const seedQuery = useSeedData();

  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: () => base44.entities.Member.list(),
    enabled: seedQuery.isSuccess,
    initialData: [],
  });

  const submissionsQuery = useQuery({
    queryKey: ["submissions"],
    queryFn: () => base44.entities.Submission.list(),
    enabled: seedQuery.isSuccess,
    initialData: [],
  });

  const members = sortMembers(membersQuery.data);
  const submissionMap = Object.fromEntries(submissionsQuery.data.map((s) => [s.member_name, s]));

  if (seedQuery.isLoading || membersQuery.isLoading || submissionsQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[var(--gold)] bg-[var(--red)] text-[28px] font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            TX
          </div>
          <div className="text-lg tracking-widest text-white/50" style={{ fontFamily: "'Oswald', sans-serif" }}>
            LOADING...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BrandHeader />
      <div className="relative z-[1]">
        <div className="mx-auto max-w-[720px] px-6 py-[60px] text-center">
          {/* Badge */}
          <div
            className="mb-8 inline-block rounded-[40px] border border-white/15 px-6 py-2 text-[13px] font-medium tracking-[3px] text-white"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", background: "linear-gradient(135deg, var(--red), #8B0000)" }}
          >
            ⚾ 2026 Season
          </div>

          {/* Headline */}
          <h2
            className="mb-3 text-[clamp(32px,6vw,54px)] font-bold leading-[1.05]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}
          >
            It's <span className="text-[var(--red)]">Baseball Time</span>
            <br />in <span className="text-[var(--gold)]">Texas</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-[520px] text-[17px] leading-relaxed text-white/60">
            Welcome to the Will Family Season Ticket Dream Sheet! Select your name below to start ranking the home games you want to attend.
          </p>

          {/* Member Grid */}
          <div className="mb-10 grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-5">
            {members.map((member) => {
              const submission = submissionMap[member.name];
              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  hasSubmitted={Boolean(submission)}
                  rankedCount={submission?.ranked_game_ids?.length || 0}
                  isLocked={submission?.is_locked}
                  onClick={() => {
                    if (submission?.is_locked) {
                      setToast(`${member.name}'s submission is locked by admin`);
                      return;
                    }
                    setLoginMember(member);
                  }}
                />
              );
            })}
          </div>

          {/* Deadline */}
          <div className="mb-6 flex items-center justify-center gap-[10px] rounded-xl border border-[rgba(191,160,72,0.2)] bg-[rgba(191,160,72,0.1)] px-5 py-[14px] text-sm text-[var(--gold)]">
            <span>📅</span>
            <span>
              <strong>Deadline:</strong> Please submit your rankings by <strong>{DEADLINE_LABEL}</strong>
            </span>
          </div>

          {/* Admin link — hidden behind double-click */}
          <div
            onDoubleClick={() => { window.location.href = createPageUrl("Admin"); }}
            className="select-none text-[13px] text-white/15 transition hover:text-white/25 cursor-default"
            title=""
          >
            ⚾
          </div>
        </div>
      </div>
      {loginMember && (
        <EmailLoginModal
          memberName={loginMember.name}
          onConfirm={(email) => {
            window.location.href = createPageUrl(`Rank?memberName=${encodeURIComponent(loginMember.name)}&email=${encodeURIComponent(email)}`);
          }}
          onCancel={() => setLoginMember(null)}
        />
      )}
      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}