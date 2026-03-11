import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import MemberCard from "@/components/rangers/MemberCard";
import useSeedData from "@/components/rangers/useSeedData";
import { DEADLINE_LABEL } from "@/components/rangers/constants";
import { sortMembers } from "@/components/rangers/utils";

export default function Index() {
  const [toast, setToast] = React.useState("");
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
  const submittedNames = new Set(submissionsQuery.data.map((submission) => submission.member_name));

  if (seedQuery.isLoading || membersQuery.isLoading || submissionsQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-xl text-white/80 oswald">Loading dream sheet…</div>;
  }

  return (
    <div className="min-h-screen">
      <BrandHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="mx-auto inline-flex rounded-full bg-[rgba(192,17,31,0.14)] px-4 py-2 text-sm font-semibold text-[var(--red)]">
            ⚾ 2026 Season
          </div>
          <h1 className="mt-6 text-5xl leading-tight text-white oswald sm:text-6xl">
            It&apos;s <span className="text-[var(--red)]">Baseball Time</span> in <span className="text-[var(--gold)]">Texas</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
            Welcome to the Will Family Season Ticket Dream Sheet! Select your name below to start ranking the home games you want to attend.
          </p>
        </div>

        <section className="mx-auto mt-10 grid max-w-5xl grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              hasSubmitted={submittedNames.has(member.name)}
              onClick={() => {
                if (submittedNames.has(member.name)) {
                  setToast(`${member.name} already has rankings saved — you can update them anytime.`);
                }
                window.location.href = createPageUrl(`Rank?memberName=${encodeURIComponent(member.name)}`);
              }}
            />
          ))}
        </section>

        <div className="mx-auto mt-8 max-w-[720px] rounded-2xl border border-[rgba(191,160,72,0.22)] bg-[rgba(191,160,72,0.1)] px-5 py-4 text-center text-base text-white/90">
          📅 Deadline: Please submit your rankings by <span className="font-bold text-[var(--gold)]">{DEADLINE_LABEL}</span>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => { window.location.href = createPageUrl("Admin"); }}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
          >
            Admin Dashboard <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}