import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import useSeedData from "@/components/rangers/useSeedData";
import { RESERVED_GAME_NUMBER } from "@/components/rangers/constants";
import { buildAllocationPlan, calculateTargets, downloadMasterScheduleCsv, downloadMemberScheduleCsv } from "@/components/rangers/adminHelpers";
import { formatGameDate, sortGames, sortMembers } from "@/components/rangers/utils";

function OwnerTag({ member }) {
  if (!member) {
    return <span className="rounded-full bg-[rgba(191,160,72,0.15)] px-3 py-1 text-xs font-semibold text-[var(--gold)]">Reserved</span>;
  }
  return <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: member.accent_color }}>{member.name}</span>;
}

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
      setToast("Allocation complete!");
      setActiveResultsTab("master");
    },
  });

  const games = sortGames(gamesQuery.data);
  const members = sortMembers(membersQuery.data);
  const submissions = submissionsQuery.data;
  const allocations = allocationsQuery.data;
  const submittedMembers = members.filter((member) => submissions.some((submission) => submission.member_name === member.name));
  const memberMap = Object.fromEntries(members.map((member) => [member.name, member]));
  const submissionMap = Object.fromEntries(submissions.map((submission) => [submission.member_name, submission]));
  const allocationMap = Object.fromEntries(allocations.map((allocation) => [allocation.game_number, allocation]));
  const targets = calculateTargets(submittedMembers);
  const counts = allocations.reduce((acc, allocation) => ({ ...acc, [allocation.assigned_to]: (acc[allocation.assigned_to] || 0) + 1 }), {});

  React.useEffect(() => {
    if (!activeSubmissionTab && submittedMembers[0]) setActiveSubmissionTab(submittedMembers[0].name);
  }, [activeSubmissionTab, submittedMembers]);

  if (seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || submissionsQuery.isLoading || allocationsQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-xl text-white/80 oswald">Loading dashboard…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => { window.location.href = createPageUrl("Index"); }} className="mb-5 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-white/75 transition hover:bg-white/5">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6">
        <h1 className="text-4xl text-white oswald">Admin Dashboard</h1>
        <p className="mt-2 text-white/70">Weighted round-robin draft across 80 draftable games (Opening Day is reserved). Higher-share members pick proportionally more games.</p>
      </div>

      <section className="mt-6 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <div className="mb-4 text-xl text-white oswald">Submission Status</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {members.map((member) => {
            const submission = submissionMap[member.name];
            return (
              <div key={member.id} className="rounded-2xl border border-white/10 bg-[var(--slate)] p-4">
                <div className="text-2xl oswald" style={{ color: member.accent_color }}>{member.name}</div>
                <div className="mt-2 text-sm text-white/60">{member.share_count} game share · Rank {member.rank_max}</div>
                <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${submission ? "bg-[rgba(34,197,94,0.16)] text-[#22C55E]" : "bg-[rgba(234,179,8,0.14)] text-[#EAB308]"}`}>
                  {submission ? `✓ ${submission.ranked_game_ids.length} ranked` : "Awaiting"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xl text-white oswald">Allocation Engine</div>
            <p className="mt-2 text-white/65">Runs the family draft and saves fresh assignments for every draftable game.</p>
          </div>
          <button
            onClick={() => allocationMutation.mutate()}
            disabled={submittedMembers.length === 0 || allocationMutation.isPending}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#C0111F,#8B0000)] px-5 text-white shadow-lg transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-40 oswald"
          >
            <Zap className="h-4 w-4" /> Run Allocation
          </button>
        </div>

        {allocations.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => downloadMasterScheduleCsv(games, allocations)} className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/5">
              <Download className="h-4 w-4" /> Master CSV
            </button>
            {submittedMembers.map((member) => (
              <button key={member.name} onClick={() => downloadMemberScheduleCsv(member.name, games, allocations)} className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/5">
                <Download className="h-4 w-4" /> {member.name}&apos;s CSV
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {allocations.length > 0 ? (
        <section className="mt-6 space-y-5 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <div className="text-xl text-white oswald">Allocation Results</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {submittedMembers.map((member) => (
              <div key={member.name} className="rounded-2xl border border-white/10 bg-[var(--slate)] p-4">
                <div className="text-2xl oswald" style={{ color: member.accent_color }}>{member.name}</div>
                <div className="mt-3 text-sm text-white/60">{counts[member.name] || 0} assigned / target {targets[member.name] || 0}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveResultsTab("master")} className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition ${activeResultsTab === "master" ? "bg-[var(--navy)] text-white" : "border border-white/10 text-white/70"}`}>
              Master Schedule
            </button>
            {submittedMembers.map((member) => (
              <button key={member.name} onClick={() => setActiveResultsTab(member.name)} className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition ${activeResultsTab === member.name ? "bg-[var(--navy)] text-white" : "border border-white/10 text-white/70"}`}>
                {member.name}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--slate)]">
            <div className="max-h-[560px] overflow-auto thin-scrollbar">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-[rgba(30,41,59,0.98)]">
                  <tr className="border-b border-white/5 text-white/60">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Opponent</th>
                    <th className="px-4 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {sortGames(games)
                    .filter((game) => activeResultsTab === "master" || allocationMap[game.game_number]?.assigned_to === activeResultsTab)
                    .map((game) => {
                      const ownerAllocation = allocationMap[game.game_number];
                      const ownerMember = ownerAllocation ? memberMap[ownerAllocation.assigned_to] : null;
                      return (
                        <tr key={game.id} className="border-b border-white/5 text-white/85 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">{game.game_number}</td>
                          <td className="px-4 py-3">{formatGameDate(game.date)}</td>
                          <td className="px-4 py-3">{game.day_of_week}</td>
                          <td className="px-4 py-3">{game.start_time}</td>
                          <td className="px-4 py-3">{game.opponent}</td>
                          <td className="px-4 py-3">
                            {game.game_number === RESERVED_GAME_NUMBER ? <OwnerTag member={null} /> : <OwnerTag member={ownerMember} />}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {submittedMembers.length > 0 ? (
        <section className="mt-6 space-y-5 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <div className="text-xl text-white oswald">Raw Submissions</div>
          <div className="flex flex-wrap gap-2">
            {submittedMembers.map((member) => (
              <button key={member.name} onClick={() => setActiveSubmissionTab(member.name)} className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition ${activeSubmissionTab === member.name ? "bg-[var(--navy)] text-white" : "border border-white/10 text-white/70"}`}>
                {member.name}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--slate)]">
            <div className="max-h-[420px] overflow-auto thin-scrollbar">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-[rgba(30,41,59,0.98)]">
                  <tr className="border-b border-white/5 text-white/60">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Opponent</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(submissionMap[activeSubmissionTab]?.ranked_game_ids || []).map((gameNumber, index) => {
                    const game = games.find((item) => item.game_number === gameNumber);
                    if (!game) return null;
                    return (
                      <tr key={`${activeSubmissionTab}-${gameNumber}`} className="border-b border-white/5 text-white/85 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-[var(--gold)] oswald">{index + 1}</td>
                        <td className="px-4 py-3">{formatGameDate(game.date)}</td>
                        <td className="px-4 py-3">{game.opponent}</td>
                        <td className="px-4 py-3">{game.start_time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}