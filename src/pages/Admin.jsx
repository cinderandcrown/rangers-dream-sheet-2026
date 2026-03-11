import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import AdminSubmissionControls from "@/components/rangers/AdminSubmissionControls";
import AllocationEditor from "@/components/rangers/AllocationEditor";
import useSeedData from "@/components/rangers/useSeedData";
import { buildAllocationPlan, calculateTargets, downloadMasterScheduleCsv, downloadMemberScheduleCsv } from "@/components/rangers/adminHelpers";
import { formatGameDate, sortGames, sortMembers } from "@/components/rangers/utils";

export default function Admin() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      setToast("Allocation complete!");
      setAllocTab("master");
    },
  });

  const games = sortGames(gamesQuery.data);
  const members = sortMembers(membersQuery.data);
  const submissions = submissionsQuery.data;
  const allocations = allocationsQuery.data;
  const submittedMembers = members.filter((m) => submissions.some((s) => s.member_name === m.name));
  const submissionMap = Object.fromEntries(submissions.map((s) => [s.member_name, s]));
  const targets = submittedMembers.length > 0 ? calculateTargets(submittedMembers) : {};

  if (seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || submissionsQuery.isLoading || allocationsQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg tracking-widest text-white/50" style={{ fontFamily: "'Oswald', sans-serif" }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div>
      <BrandHeader showBack onBack={() => { window.location.href = createPageUrl("Index"); }} />
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
          <p className="mb-4 text-sm text-white/50">Weighted round-robin draft across 80 draftable games (Opening Day is reserved). Higher-share members pick proportionally more.</p>
          <div className="flex flex-wrap gap-[10px]">
            <button
              onClick={() => allocationMutation.mutate()}
              disabled={submittedMembers.length === 0 || allocationMutation.isPending}
              className="rounded-[10px] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)] disabled:opacity-40"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", background: "linear-gradient(135deg, var(--red), #8B0000)" }}
            >
              ⚡ Run Allocation
            </button>
            {allocations.length > 0 ? (
              <>
                <button onClick={() => downloadMasterScheduleCsv(games, allocations)} className="rounded-[10px] border border-white/12 bg-transparent px-4 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
                  📥 Master CSV
                </button>
                {submittedMembers.map((m) => (
                  <button key={m.name} onClick={() => downloadMemberScheduleCsv(m.name, games, allocations)} className="rounded-[10px] border border-white/12 bg-transparent px-4 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
                    📥 {m.name}'s CSV
                  </button>
                ))}
              </>
            ) : null}
          </div>
        </div>

        {/* Allocation Results */}
        {allocations.length > 0 ? (
          <div className="mb-5 rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-6">
            <h4 className="mb-4 text-lg font-semibold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
              Allocation Results
            </h4>
            <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
              {submittedMembers.map((m) => (
                <div key={m.name} className="rounded-[14px] border border-white/[0.06] bg-[var(--slate)] p-5 text-center">
                  <div className="mb-1.5 text-base font-semibold" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", color: m.accent_color }}>
                    {m.name}
                  </div>
                  <div className="text-[28px] font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>{counts[m.name] || 0}</div>
                  <div className="text-xs text-white/40">games assigned (target: {targets[m.name] || 0})</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mb-4 flex flex-wrap gap-1">
              <button onClick={() => setAllocTab("master")} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${allocTab === "master" ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`} style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Master Schedule
              </button>
              {submittedMembers.map((m) => (
                <button key={m.name} onClick={() => setAllocTab(m.name)} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${allocTab === m.name ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`} style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {m.name}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="thin-scrollbar max-h-[500px] overflow-y-auto rounded-lg">
              <table className="at">
                <thead>
                  <tr><th>#</th><th>Date</th><th>Day</th><th>Time</th><th>Opponent</th><th>Owner</th></tr>
                </thead>
                <tbody>
                  {(allocTab === "master" ? games : games.filter((g) => allocationMap[g.game_number]?.assigned_to === allocTab)).map((g, i) => {
                    const owner = g.game_number === RESERVED_GAME_NUMBER ? "Reserved" : allocationMap[g.game_number]?.assigned_to || "";
                    return (
                      <tr key={g.id}>
                        <td className="text-white/30">{i + 1}</td>
                        <td>{formatGameDate(g.date)}</td>
                        <td>{g.day_of_week}</td>
                        <td>{g.start_time}</td>
                        <td>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getTeamColor(g.opponent) }} />
                            {g.opponent}{g.game_number === RESERVED_GAME_NUMBER ? " ★" : ""}
                          </span>
                        </td>
                        <td>
                          <span
                            className="inline-block rounded-md px-[10px] py-0.5 text-xs font-medium"
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              backgroundColor: `${mc(owner)}22`,
                              color: mc(owner)
                            }}
                          >
                            {owner}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Raw Submissions */}
        {submittedMembers.length > 0 ? (
          <div className="mb-5 rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-6">
            <h4 className="mb-4 text-lg font-semibold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
              Raw Submissions
            </h4>
            <div className="mb-4 flex flex-wrap gap-1">
              {submittedMembers.map((m) => (
                <button key={m.name} onClick={() => setAllocTab(`raw-${m.name}`)} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${allocTab === `raw-${m.name}` ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`} style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {m.name}
                </button>
              ))}
            </div>
            {submittedMembers.map((m) => {
              if (allocTab !== `raw-${m.name}`) return null;
              const ranked = submissionMap[m.name]?.ranked_game_ids || [];
              return (
                <div key={m.name} className="thin-scrollbar max-h-[500px] overflow-y-auto rounded-lg">
                  <table className="at">
                    <thead><tr><th>Rank</th><th>Date</th><th>Opponent</th><th>Time</th></tr></thead>
                    <tbody>
                      {ranked.map((gid, idx) => {
                        const g = games.find((x) => x.game_number === gid);
                        if (!g) return null;
                        return (
                          <tr key={gid}>
                            <td className="font-semibold text-[var(--gold)]">{idx + 1}</td>
                            <td>{g.day_of_week}, {formatGameDate(g.date)}</td>
                            <td>{g.opponent}</td>
                            <td>{g.start_time}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}