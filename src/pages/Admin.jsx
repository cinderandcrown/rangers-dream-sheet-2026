import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import AdminSubmissionControls from "@/components/rangers/AdminSubmissionControls";
import AllocationEditor from "@/components/rangers/AllocationEditor";
import useSeedData from "@/components/rangers/useSeedData";
import RawSubmissions from "@/components/rangers/RawSubmissions";
import { buildAllocationPlan, calculateTargets, downloadMasterScheduleCsv, downloadMemberScheduleCsv } from "@/components/rangers/adminHelpers";
import { sortGames, sortMembers } from "@/components/rangers/utils";
import AdminGate from "@/components/rangers/AdminGate";
import LoadingScreen from "@/components/rangers/LoadingScreen";
import ScheduleDistribution from "@/components/rangers/ScheduleDistribution";
import AnalyticsDashboard from "@/components/rangers/analytics/AnalyticsDashboard";

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const seedQuery = useSeedData();
  const [toast, setToast] = React.useState("");

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: () => base44.entities.Member.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const gamesQuery = useQuery({ queryKey: ["games"], queryFn: () => base44.entities.Game.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const submissionsQuery = useQuery({ queryKey: ["submissions"], queryFn: () => base44.entities.Submission.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const allocationsQuery = useQuery({ queryKey: ["allocations"], queryFn: () => base44.entities.Allocation.list(), enabled: seedQuery.isSuccess, initialData: [] });

  const allocationMutation = useMutation({
    mutationFn: async () => {
      const g = sortGames(gamesQuery.data);
      const m = sortMembers(membersQuery.data);
      const s = submissionsQuery.data;
      const { allocations } = buildAllocationPlan(g, m, s);
      const existing = allocationsQuery.data;
      await Promise.all(existing.map((a) => base44.entities.Allocation.delete(a.id)));
      if (allocations.length > 0) await base44.entities.Allocation.bulkCreate(allocations);
      return allocations;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["allocations"] });
      const prev = queryClient.getQueryData(["allocations"]);
      const g = sortGames(gamesQuery.data);
      const m = sortMembers(membersQuery.data);
      const s = submissionsQuery.data;
      const { allocations: optimistic } = buildAllocationPlan(g, m, s);
      queryClient.setQueryData(["allocations"], optimistic);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["allocations"], ctx.prev);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["allocations"], data);
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      setToast("Allocation complete!");
    },
  });

  const games = sortGames(gamesQuery.data);
  const members = sortMembers(membersQuery.data);
  const submissions = submissionsQuery.data;
  const allocations = allocationsQuery.data;
  const submittedMembers = members.filter((m) => submissions.some((s) => s.member_name === m.name));
  const submissionMap = Object.fromEntries(submissions.map((s) => [s.member_name, s]));
  const targets = members.length > 0 ? calculateTargets(members) : {};

  if (seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || submissionsQuery.isLoading || allocationsQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AdminGate>
      <div>
        <BrandHeader showBack onBack={() => navigate(createPageUrl("Index"))} />
        <div className="relative z-[1] mx-auto max-w-[1100px] px-6 py-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3
                className="mb-2 text-[26px] font-bold"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}
              >
                Admin Dashboard <span className="text-[var(--gold)]">👑</span>
              </h3>
              <p className="text-[15px] text-white/50">Clark's control center — manage submissions, run allocations, and finalize assignments.</p>
            </div>
          </div>

          {/* Submission Status with Controls */}
          <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            {members.map((m) => (
              <AdminSubmissionControls
                key={m.id}
                member={m}
                submission={submissionMap[m.name]}
                onToast={setToast}
              />
            ))}
          </div>

          {/* Allocation Engine */}
          <div className="mb-5 rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-6">
            <h4 className="mb-4 text-lg font-semibold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
              Allocation Engine
            </h4>
            <p className="mb-4 text-sm text-white/50">Weighted round-robin draft across 80 draftable games (Opening Day reserved). Clark drafts first as group owner, then by share count. After running, you can swap any game assignment before finalizing.</p>
            <div className="flex flex-wrap gap-[10px]">
              <button
                onClick={() => {
                  if (allocations.length > 0) {
                    if (!window.confirm(`⚠️ Re-running allocation will replace the current assignments. ${allocations.length} games are currently allocated. Continue?`)) return;
                  }
                  allocationMutation.mutate();
                }}
                disabled={members.length === 0 || allocationMutation.isPending}
                className="btn-red-gradient rounded-[10px] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)] disabled:opacity-40"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                ⚡ Run Allocation
              </button>
              {allocations.length > 0 ? (
                <>
                  <button onClick={() => downloadMasterScheduleCsv(games, allocations)} className="rounded-[10px] border border-white/12 bg-transparent px-4 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
                    📥 Master CSV
                  </button>
                  {members.map((m) => (
                    <button key={m.name} onClick={() => downloadMemberScheduleCsv(m.name, games, allocations)} className="rounded-[10px] border border-white/12 bg-transparent px-4 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
                      📥 {m.name}'s CSV
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          </div>

          {/* Allocation Results — Editable */}
          {allocations.length > 0 && (
            <div className="mb-5">
              <AllocationEditor
                games={games}
                members={members}
                allocations={allocations}
                targets={targets}
                onToast={setToast}
              />
            </div>
          )}

          {/* Preference Analytics */}
          {allocations.length > 0 && submissions.length > 0 && (
            <AnalyticsDashboard
              members={members}
              games={games}
              submissions={submissions}
              allocations={allocations}
            />
          )}

          {/* Schedule Distribution */}
          {allocations.length > 0 && (
            <ScheduleDistribution
              members={members}
              games={games}
              allocations={allocations}
              onToast={setToast}
            />
          )}

          {/* Raw Submissions */}
          {submittedMembers.length > 0 && (
            <RawSubmissions submittedMembers={submittedMembers} submissionMap={submissionMap} games={games} />
          )}
        </div>
        <AppToast toast={toast} onClose={() => setToast("")} />
      </div>
    </AdminGate>
  );
}