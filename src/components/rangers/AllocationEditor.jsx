import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatGameDate, getTeamColor, sortGames } from "./utils";
import { getTeamLogoUrl } from "./teamLogos";
import { RESERVED_GAME_NUMBER } from "./constants";

export default function AllocationEditor({ games, members, allocations, targets, onToast }) {
  const queryClient = useQueryClient();
  const [editingGame, setEditingGame] = useState(null);
  const [allocTab, setAllocTab] = useState("master");

  const allocationMap = Object.fromEntries(allocations.map((a) => [a.game_number, a]));
  const counts = allocations.reduce((acc, a) => ({ ...acc, [a.assigned_to]: (acc[a.assigned_to] || 0) + 1 }), {});
  const mc = (name) => members.find((m) => m.name === name)?.accent_color || "#555";

  const reassignMutation = useMutation({
    mutationFn: async ({ gameNumber, newOwner }) => {
      const existing = allocations.find((a) => a.game_number === gameNumber);
      if (existing) {
        await base44.entities.Allocation.update(existing.id, {
          assigned_to: newOwner,
          manually_assigned: true,
          was_ranked: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      setEditingGame(null);
      onToast("Game reassigned");
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(allocations.map((a) => base44.entities.Allocation.update(a.id, { is_finalized: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      onToast("All allocations finalized!");
    },
  });

  const sorted = sortGames(games);
  const isFinalized = allocations.length > 0 && allocations.every((a) => a.is_finalized);

  return (
    <div className="rounded-2xl border border-white/[0.06] p-6" style={{ backgroundColor: "#1E293B" }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-lg font-semibold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
          Allocation Results {isFinalized && <span className="ml-2 text-sm text-[#22C55E]">✓ FINALIZED</span>}
        </h4>
        {!isFinalized && allocations.length > 0 && (
          <button
            onClick={() => { if (window.confirm("Finalize all allocations? Members will see their final assignments.")) finalizeMutation.mutate(); }}
            disabled={finalizeMutation.isPending}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", background: "linear-gradient(135deg, #22C55E, #15803D)" }}
          >
            ✓ Finalize All
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {members.map((m) => {
          const count = counts[m.name] || 0;
          const target = targets[m.name] || 0;
          const diff = count - target;
          return (
            <div key={m.name} className="rounded-[14px] border border-white/[0.06] p-4 text-center" style={{ backgroundColor: "#0F172A" }}>
              <div className="mb-1 text-base font-semibold" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", color: m.accent_color }}>
                {m.name} {m.name === "Clark" && <span className="text-[10px] text-[var(--gold)]">👑</span>}
              </div>
              <div className="text-[28px] font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>{count}</div>
              <div className="text-xs text-white/40">
                target: {target}
                {diff !== 0 && <span className={diff > 0 ? " text-[#22C55E]" : " text-[#EF4444]"}> ({diff > 0 ? "+" : ""}{diff})</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1">
        <button onClick={() => setAllocTab("master")} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${allocTab === "master" ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`} style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Master
        </button>
        {members.map((m) => (
          <button key={m.name} onClick={() => setAllocTab(m.name)} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${allocTab === m.name ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`} style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {m.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="thin-scrollbar max-h-[500px] overflow-y-auto rounded-lg">
        <table className="at">
          <thead>
            <tr><th>#</th><th>Date</th><th>Day</th><th>Time</th><th>Opponent</th><th>Owner</th><th>Source</th><th></th></tr>
          </thead>
          <tbody>
            {(allocTab === "master" ? sorted : sorted.filter((g) => allocationMap[g.game_number]?.assigned_to === allocTab)).map((g, i) => {
              const alloc = allocationMap[g.game_number];
              const owner = g.game_number === RESERVED_GAME_NUMBER ? "Reserved" : alloc?.assigned_to || "";
              const isEditing = editingGame === g.game_number;
              const logoUrl = getTeamLogoUrl(g.opponent);

              return (
                <tr key={g.id}>
                  <td className="text-white/30">{i + 1}</td>
                  <td>{formatGameDate(g.date)}</td>
                  <td>{g.day_of_week}</td>
                  <td>{g.start_time}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5">
                      {logoUrl ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded" style={{ backgroundColor: getTeamColor(g.opponent) }}>
                          <img src={logoUrl} alt="" className="h-4 w-4 object-contain" />
                        </span>
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getTeamColor(g.opponent) }} />
                      )}
                      {g.opponent}{g.game_number === RESERVED_GAME_NUMBER ? " ★" : ""}
                    </span>
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        {members.map((m) => (
                          <button
                            key={m.name}
                            onClick={() => reassignMutation.mutate({ gameNumber: g.game_number, newOwner: m.name })}
                            className="rounded-md px-2 py-0.5 text-[11px] font-medium transition hover:opacity-80"
                            style={{ fontFamily: "'Oswald', sans-serif", backgroundColor: `${m.accent_color}33`, color: m.accent_color }}
                          >
                            {m.name}
                          </button>
                        ))}
                        <button onClick={() => setEditingGame(null)} className="ml-1 text-[11px] text-white/30 hover:text-white">✕</button>
                      </div>
                    ) : (
                      <span
                        className="inline-block rounded-md px-[10px] py-0.5 text-xs font-medium"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          backgroundColor: owner === "Reserved" ? "rgba(191,160,72,0.15)" : `${mc(owner)}22`,
                          color: owner === "Reserved" ? "var(--gold)" : mc(owner)
                        }}
                      >
                        {owner}
                      </span>
                    )}
                  </td>
                  <td>
                    {alloc?.manually_assigned ? (
                      <span className="text-[10px] text-[#F59E0B]">MANUAL</span>
                    ) : alloc?.was_ranked ? (
                      <span className="text-[10px] text-white/30">Rank #{alloc.rank_position || "?"}</span>
                    ) : alloc ? (
                      <span className="text-[10px] text-white/20">Fallback</span>
                    ) : null}
                  </td>
                  <td>
                    {g.game_number !== RESERVED_GAME_NUMBER && alloc && !isFinalized && (
                      <button
                        onClick={() => setEditingGame(isEditing ? null : g.game_number)}
                        className="rounded px-2 py-0.5 text-[10px] text-white/30 transition hover:bg-white/[0.06] hover:text-white"
                        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                      >
                        {isEditing ? "Cancel" : "Swap"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}