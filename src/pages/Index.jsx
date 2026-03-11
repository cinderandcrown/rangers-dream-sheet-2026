import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
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
  const submissionMap = Object.fromEntries(submissionsQuery.data.map((s) => [s.member_name, s]));
  const submittedCount = submissionsQuery.data.length;
  const totalMembers = members.length;

  if (seedQuery.isLoading || membersQuery.isLoading || submissionsQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--gold)]/20 border-t-[var(--gold)]" />
        <span className="text-lg text-white/60 oswald">Loading dream sheet…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BrandHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative glow orbs */}
        <div className="hero-glow pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--navy)] opacity-20 blur-[100px]" />
        <div className="hero-glow pointer-events-none absolute -bottom-20 right-0 h-[300px] w-[400px] rounded-full bg-[var(--red)] opacity-10 blur-[80px]" />

        <div className="relative mx-auto max-w-5xl px-4 pb-4 pt-16 text-center sm:px-6 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--red)]/25 bg-[var(--red)]/10 px-4 py-2">
              <span className="text-sm">⚾</span>
              <span className="text-sm font-bold tracking-wider text-[var(--red)] oswald">2026 Season</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-8 text-5xl leading-[1.1] text-white oswald sm:text-7xl"
          >
            It&apos;s <span className="text-[var(--red)]">Baseball Time</span>
            <br />
            in <span className="text-[var(--gold)]">Texas</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65"
          >
            Welcome to the Will Family Season Ticket Dream Sheet! Select your name below to start ranking the home games you want to attend.
          </motion.p>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.04] px-5 py-2.5"
          >
            <span className="text-xs text-white/40">Submissions</span>
            <div className="flex items-center gap-1.5">
              {members.map((m) => (
                <div
                  key={m.name}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: submissionMap[m.name] ? "#22C55E" : "rgba(255,255,255,0.15)" }}
                  title={m.name}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[var(--gold)]">{submittedCount}/{totalMembers}</span>
          </motion.div>
        </div>
      </div>

      {/* Member Grid */}
      <main className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4"
        >
          {members.map((member, i) => {
            const submission = submissionMap[member.name];
            return (
              <MemberCard
                key={member.id}
                member={member}
                hasSubmitted={Boolean(submission)}
                rankedCount={submission?.ranked_game_ids?.length || 0}
                onClick={() => {
                  window.location.href = createPageUrl(`Rank?memberName=${encodeURIComponent(member.name)}`);
                }}
              />
            );
          })}
        </motion.section>

        {/* Deadline Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="section-panel mx-auto mt-10 max-w-[680px] p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/12">
              <Calendar className="h-5 w-5 text-[var(--gold)]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]/70">Deadline</div>
              <div className="mt-0.5 text-base text-white/90">
                Submit your rankings by <span className="font-bold text-[var(--gold)]">{DEADLINE_LABEL}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => { window.location.href = createPageUrl("Admin"); }}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white/90"
          >
            Admin Dashboard
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </main>
      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}