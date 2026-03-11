import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import AdminStatusCard from "@/components/rangers/AdminStatusCard";
import AdminResultsTable from "@/components/rangers/AdminResultsTable";
import useSeedData from "@/components/rangers/useSeedData";
import { buildAllocationPlan, calculateTargets, downloadMasterScheduleCsv, downloadMemberScheduleCsv } from "@/components/rangers/adminHelpers";
import { formatGameDate, sortGames, sortMembers, getTeamColor, getTeamAbbreviation } from "@/components/rangers/utils";

export default function Admin() {
  const queryClient = useQueryClient();
  const seedQuery = useSeedData();
  const [toast, setToast] = React.useState("");
  const [activeResultsTab, setActiveResultsTab] = React.useState("master");
  const [activeSubmissionTab, setActiveSubmissionTab] = React.useState("");

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: () => base44.entities.Member.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const gamesQuery = useQuery({ queryKey: ["games"], queryFn: () => base44.entities.Game.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const submissionsQuery = useQuery({ queryKey: ["submissions"], queryFn: () => base44.entities.Submission.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const allocationsQuery = useQuery({ queryKey: ["allocations"], queryFn: () => base44.entities.Allocation.list(), enabled: seedQuery.isSuccess, initialData: [] });

  const allocationMutation = useMutation({
    mutationFn: async () => {
      const games = sortGames(gamesQuery.data);
      const members = sortMembers(membersQuery.data);
      const submissions = submissionsQuery.data;
      const { allocations } = buildAllocationPlan(games, members, submissions);
      const existingAllocations = allocationsQuery.data;

      await Promise.all(existingAllocations.map((allocation) => base44.entities.Allocation.delete(allocation.id)));
      if (allocations.length > 0) {
        await base44.entities.Allocation.bulkCreate(allocations);
      }
      return allocations;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      setToast("Allocation complete — 80 games assigned!");
      setActiveResultsTab("master");
    },
  });

  const games = sortGames(gamesQuery.data);
  const members = sortMembers(membersQuery.data);
  const submissions = submissionsQuery.data;
  const allocations = allocationsQuery.data;
  const submittedMembers = members.filter((member) => submissions.some((s) => s.member_name === member.name));
  const memberMap = Object.fromEntries(members.map((m) => [m.name, m]));
  const submissionMap = Object.fromEntries(submissions.map((s) => [s.member_name, s]));
  const targets = submittedMembers.length > 0 ? calculateTargets(submittedMembers) : {};
  const counts = allocations.reduce((acc, a) => ({ ...acc, [a.assigned_to]: (acc[a.assigned_to] || 0) + 1 }), {});

  React.useEffect(() => {
    if (!activeSubmissionTab && submittedMembers[0]) setActiveSubmissionTab(submittedMembers[0].name);
  }, [activeSubmissionTab, submittedMembers]);

  if (seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || submissionsQuery.isLoading || allocationsQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--gold)]/20 border-t-[var(--gold)]" />
        <span className="text-lg text-white/60 oswald">Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BrandHeader showBack onBack={() => { window.location.href = createPageUrl("Index"); }} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-panel p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--red)]/15">
              <Zap className="h-5 w-5 text-[var(--red)]" />
            </div>
            <div>
              <h1 className="text-3xl text-white oswald sm:text-4xl">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-white/50">Manage submissions, run the draft, and export schedules.</p>
            </div>
          </div>
        </motion.div>

        {/* Submission Status */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="section-panel mt-5 p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[var(--gold)]" />
            <span className="text-base text-white oswald">Submission Status</span>
            <span className="ml-auto text-xs text-white/40">{submittedMembers.length}/{members.length} submitted</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {members.map((member) => (
              <AdminStatusCard key={member.id} member={member} submission={submissionMap[member.name]} />
            ))}
          </div>
        </motion.section>

        {/* Allocation Engine */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="section-panel mt-5 p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--red)]" />
                <span className="text-base text-white oswald">Allocation Engine</span>
              </div>
              <p className="mt-1.5 text-sm text-white/45">Weighted round-robin draft across 80 draftable games. Opening Day is reserved.</p>
            </div>
            <button
              onClick={() => allocationMutation.mutate()}
              disabled={submittedMembers.length === 0 || allocationMutation.isPending}
              className="btn-primary-red inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-lg shadow-red-900/20 disabled:cursor-not-allowed disabled:opacity-30 oswald"
            >
              {allocationMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" /></svg>
                  Running…
                </span>
              ) : (
                <><Zap className="h-4 w-4" /> Run Allocation</>
              )}
            </button>
          </div>

          {allocations.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => downloadMasterScheduleCsv(games, allocations)} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-4 text-xs font-semibold text-white/70 transition hover:bg-white/[0.06]">
                <Download className="h-3.5 w-3.5" /> Master CSV
              </button>
              {submittedMembers.map((member) => (
                <button key={member.name} onClick={() => downloadMemberScheduleCsv(member.name, games, allocations)} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-4 text-xs font-semibold text-white/70 transition hover:bg-white/[0.06]">
                  <Download className="h-3.5 w-3.5" /> {member.name}
                </button>
              ))}
            </div>
          ) : null}
        </motion.section>

        {/* Allocation Results */}
        {allocations.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="section-panel mt-5 space-y-4 p-5"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--gold)]" />
              <span className="text-base text-white oswald">Allocation Results</span>
            </div>

            {/* Summary cards */}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {submittedMembers.map((member) => {
                const assigned = counts[member.name] || 0;
                const target = targets[member.name] || 0;
                const pct = target > 0 ? Math.round((assigned / target) * 100) : 0;
                return (
                  <div key={member.name} className="glass-card relative overflow-hidden rounded-xl p-4">
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: member.accent_color, opacity: 0.6 }} />
                    </div>
                    <div className="text-lg oswald" style={{ color: member.accent_color }}>{member.name}</div>
                    <div className="mt-1 text-2xl font-bold text-white">{assigned} <span className="text-sm font-normal text-white/35">/ {target}</span></div>
                  </div>
                );
              })}
            </div>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setActiveResultsTab("master")} className={`min-h-[36px] rounded-lg px-4 text-xs font-semibold transition ${activeResultsTab === "master" ? "bg-[var(--navy)] text-white shadow-lg" : "border border-white/8 bg-white/[0.03] text-white/55"}`}>
                Master Schedule
              </button>
              {submittedMembers.map((member) => (
                <button key={member.name} onClick={() => setActiveResultsTab(member.name)} className={`min-h-[36px] rounded-lg px-4 text-xs font-semibold transition ${activeResultsTab === member.name ? "bg-[var(--navy)] text-white shadow-lg" : "border border-white/8 bg-white/[0.03] text-white/55"}`}>
                  {member.name}
                </button>
              ))}
            </div>

            <AdminResultsTable games={games} allocations={allocations} memberMap={memberMap} activeTab={activeResultsTab} />
          </motion.section>
        ) : null}

        {/* Raw Submissions */}
        {submittedMembers.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="section-panel mt-5 space-y-4 p-5"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-white/20" />
              <span className="text-base text-white oswald">Raw Submissions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {submittedMembers.map((member) => (
                <button key={member.name} onClick={() => setActiveSubmissionTab(member.name)} className={`min-h-[36px] rounded-lg px-4 text-xs font-semibold transition ${activeSubmissionTab === member.name ? "bg-[var(--navy)] text-white shadow-lg" : "border border-white/8 bg-white/[0.03] text-white/55"}`}>
                  {member.name}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-white/6 bg-[rgba(10,22,40,0.6)]">
              <div className="max-h-[420px] overflow-auto thin-scrollbar">
                <table className="data-table min-w-full text-left">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Date</th>
                      <th>Opponent</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(submissionMap[activeSubmissionTab]?.ranked_game_ids || []).map((gameNumber, index) => {
                      const game = games.find((item) => item.game_number === gameNumber);
                      if (!game) return null;
                      const teamColor = getTeamColor(game.opponent);
                      return (
                        <tr key={`${activeSubmissionTab}-${gameNumber}`} className="text-white/80">
                          <td>
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--gold)]/12 text-xs font-bold text-[var(--gold)] oswald">
                              {index + 1}
                            </span>
                          </td>
                          <td>{formatGameDate(game.date)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md text-[8px] font-bold text-white oswald" style={{ backgroundColor: teamColor }}>
                                {getTeamAbbreviation(game.opponent).slice(0, 2)}
                              </div>
                              {game.opponent}
                            </div>
                          </td>
                          <td className="text-white/50">{game.start_time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        ) : null}
      </div>

      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}