import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import MemberCard from "@/components/rangers/MemberCard";
import EmailLoginModal from "@/components/rangers/EmailLoginModal";
import HeroSection from "@/components/rangers/HeroSection";
import LoadingScreen from "@/components/rangers/LoadingScreen";
import PrivacySection from "../components/rangers/PrivacySection";
import PullToRefresh from "@/components/rangers/PullToRefresh";
import useSeedData from "@/components/rangers/useSeedData";
import { DEADLINE_LABEL, GAME_SEED_DATA } from "@/components/rangers/constants";
import { sortMembers } from "@/components/rangers/utils";

export default function Index() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = React.useState("");
  const [loginMember, setLoginMember] = React.useState(null);
  const seedQuery = useSeedData();

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["members"] }),
      queryClient.refetchQueries({ queryKey: ["submissions"] }),
    ]);
  };

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

  const allocationsQuery = useQuery({
    queryKey: ["allocations"],
    queryFn: () => base44.entities.Allocation.list(),
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
        <div className="animate-fade-slide-up">
          <HeroSection
            totalGames={GAME_SEED_DATA.length}
            submittedCount={submittedCount}
            totalMembers={members.length}
            allocations={allocationsQuery.data}
          />
        </div>

        {/* Members section */}
        <PullToRefresh onRefresh={handleRefresh}>
        <div className="mx-auto max-w-[780px] px-6 pb-24">
          {/* Section label */}
          <div className="mb-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span
              className="text-[10px] font-semibold tracking-[2.5px] text-white/20"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              Tap Your Name to Start
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Member Grid */}
          <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
            {members.map((member, i) => {
              const submission = submissionMap[member.name];
              return (
                <div key={member.id} className="animate-card-entrance" style={{ animationDelay: `${300 + i * 80}ms` }}>
                  <MemberCard
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
                </div>
              );
            })}
          </div>

          {/* Quick actions row */}
          <div className="mb-10 mx-auto max-w-[540px] grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <button
              onClick={() => navigate("/MyGames")}
              className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(191,160,72,0.15)] bg-[rgba(191,160,72,0.05)] px-4 py-3.5 text-[12px] font-semibold text-[var(--gold)] transition hover:border-[rgba(191,160,72,0.3)] hover:bg-[rgba(191,160,72,0.1)] hover:-translate-y-0.5"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              📅 My Game Schedule
            </button>
            <div
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-center"
            >
              <div>
                <div className="text-[12px] font-semibold tracking-[1px] text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                  Deadline
                </div>
                <div className="text-[13px] text-white/50 font-medium">{DEADLINE_LABEL}</div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mx-auto mb-10 max-w-[500px]">
            <div className="grid grid-cols-3 gap-3 text-center">
              <StepCard num="1" text="Select name & enter email" />
              <StepCard num="2" text="Rank your favorite games" />
              <StepCard num="3" text="Clark runs the allocation" />
            </div>
          </div>

          {/* Privacy section */}
          <PrivacySection
            members={members}
            submissionMap={submissionMap}
            onToast={setToast}
          />

          {/* Admin access */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(createPageUrl("Admin"))}
              className="text-[11px] text-white/15 underline underline-offset-2 transition hover:text-white/35"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Admin Dashboard →
            </button>
          </div>

          {/* Footer branding */}
          <div className="flex items-center justify-center gap-2 py-6 mt-8 border-t border-white/[0.04]">
            <img src="https://media.base44.com/images/public/69b1a5ab39d1912af6d745af/1f8631791_CinderCrown-MuteLogo.png" alt="Cinder & Crown" className="h-4 w-4 opacity-[0.15]" />
            <p className="text-[11px] text-white/[0.12] tracking-wide">
              Built by <a href="https://cinderandcrown.com" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/40 underline underline-offset-2 transition">Cinder & Crown Creative</a>
            </p>
          </div>
        </div>
        </PullToRefresh>
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
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-[11px] font-bold text-white/30"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {num}
      </div>
      <p className="text-[11px] leading-[1.35] text-white/25">{text}</p>
    </div>
  );
}