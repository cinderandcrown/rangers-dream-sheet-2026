import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import MemberCard from "@/components/rangers/MemberCard";
import EmailLoginModal from "@/components/rangers/EmailLoginModal";
import HeroSection from "@/components/rangers/HeroSection";
import LoadingScreen from "@/components/rangers/LoadingScreen";
import PrivacySection from "../components/rangers/PrivacySection";
import useSeedData from "@/components/rangers/useSeedData";
import { DEADLINE_LABEL, GAME_SEED_DATA } from "@/components/rangers/constants";
import { sortMembers } from "@/components/rangers/utils";

export default function Index() {
  const navigate = useNavigate();
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
  const submittedCount = members.filter((m) => submissionMap[m.name]).length;

  if (seedQuery.isLoading || membersQuery.isLoading || submissionsQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <BrandHeader />
      <div className="relative z-[1]">
        {/* Hero */}
        <HeroSection
          totalGames={GAME_SEED_DATA.length}
          submittedCount={submittedCount}
          totalMembers={members.length}
        />

        {/* Members section */}
        <div className="mx-auto max-w-[780px] px-6 pb-16">
          {/* Section label */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span
              className="text-[11px] font-semibold tracking-[3px] text-white/25"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              Select Your Name
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Member Grid */}
          <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
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

          {/* Deadline banner */}
          <div
            className="mx-auto max-w-[540px] overflow-hidden rounded-2xl border border-[rgba(191,160,72,0.12)]"
            style={{ background: "linear-gradient(135deg, rgba(191,160,72,0.08), rgba(191,160,72,0.03))" }}
          >
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(191,160,72,0.12)] text-lg">
                📅
              </div>
              <div>
                <div
                  className="text-[12px] font-semibold tracking-[2px] text-[var(--gold)]"
                  style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                >
                  Submission Deadline
                </div>
                <div className="text-[14px] text-white/60">
                  Please submit your rankings by <strong className="text-white/80">{DEADLINE_LABEL}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* How it works — subtle helper text */}
          <div className="mx-auto mt-10 max-w-[520px]">
            <div className="grid grid-cols-3 gap-4 text-center">
              <StepCard num="1" text="Select your name & enter email" />
              <StepCard num="2" text="Rank your favorite home games" />
              <StepCard num="3" text="Clark runs the draft allocation" />
            </div>
          </div>

          {/* Privacy section */}
          <PrivacySection
            members={members}
            submissionMap={submissionMap}
            onToast={setToast}
          />

          {/* Hidden admin access */}
          <div className="mt-12 text-center">
            <div
              onDoubleClick={() => navigate(createPageUrl("Admin"))}
              className="inline-block cursor-default select-none text-[13px] text-white/[0.08] transition hover:text-white/15"
            >
              ⚾
            </div>
          </div>
        </div>
      </div>

      {loginMember && (
        <EmailLoginModal
          memberName={loginMember.name}
          onConfirm={(email) => {
            navigate(createPageUrl(`Rank?memberName=${encodeURIComponent(loginMember.name)}&email=${encodeURIComponent(email)}`));
          }}
          onCancel={() => setLoginMember(null)}
        />
      )}
      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}

function StepCard({ num, text }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[13px] font-bold text-white/40"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {num}
      </div>
      <p className="text-[12px] leading-[1.4] text-white/30">{text}</p>
    </div>
  );
}