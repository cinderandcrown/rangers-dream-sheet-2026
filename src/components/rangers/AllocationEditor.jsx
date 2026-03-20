import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatGameDate, getTeamColor, sortGames } from "./utils";
import { getTeamLogoUrl } from "./teamLogos";
import { RESERVED_GAME_NUMBER } from "./constants";
import useOptimisticMutation from "@/lib/useOptimisticMutation";

export default function AllocationEditor({ games, members, allocations, targets, onToast }) {
  const [editingGame, setEditingGame] = useState(null);
  const [allocTab, setAllocTab] = useState("master");

  const allocationMap = Object.fromEntries(allocations.map((allocation) => [allocation.game_number, allocation]));
  const counts = allocations.reduce((acc, allocation) => ({ ...acc, [allocation.assigned_to]: (acc[allocation.assigned_to] || 0) + 1 }), {});
  const memberColor = (name) => members.find((member) => member.name === name)?.accent_color || "#555";

  const reassignMutation = useOptimisticMutation({
    mutationFn: async ({ gameNumber, newOwner }) => {
      const existing = allocations.find((allocation) => allocation.game_number === gameNumber);
      if (!existing) return null;

      return base44.entities.Allocation.update(existing.id, {
        assigned_to: newOwner,
        manually_assigned: true,
        was_ranked: false,
        rank_position: null,
      });
    },
    optimisticUpdates: [
      {
        queryKey: ["allocations"],
        updater: (old = [], { gameNumber, newOwner }) => old.map((allocation) => (
          allocation.game_number === gameNumber
            ? {
                ...allocation,
                assigned_to: newOwner,
                manually_assigned: true,
                was_ranked: false,
                rank_position: null,
              }
            : allocation
        )),
      },
    ],
    invalidateKeys: [["allocations"]],
    onSuccess: () => {
      setEditingGame(null);
      onToast("Game reassigned");
    },
  });

  const finalizeMutation = useOptimisticMutation({
    mutationFn: async () => {
      await Promise.all(allocations.map((allocation) => base44.entities.Allocation.update(allocation.id, { is_finalized: true })));
      return true;
    },
    optimisticUpdates: [
      {
        queryKey: ["allocations"],
        updater: (old = []) => old.map((allocation) => ({ ...allocation, is_finalized: true })),
      },
    ],
    invalidateKeys: [["allocations"]],
    onSuccess: () => {
      onToast("All allocations finalized!");
    },
  });

  const sortedGames = sortGames(games);
  const isFinalized = allocations.length > 0 && allocations.every((allocation) => allocation.is_finalized);

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
            aria-label="Finalize all game allocations"
            className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", background: "linear-gradient(135deg, #22C55E, #15803D)" }}
          >
            ✓ Finalize All
          </button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {members.map((member) => {
          const count = counts[member.name] || 0;
          const target = targets[member.name] || 0;
          const diff = count - target;
          return (
            <div key={member.name} className="rounded-[14px] border border-white/[0.06] p-4 text-center" style={{ backgroundColor: "#0F172A" }}>
              <div className="mb-1 text-base font-semibold" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", color: member.accent_color }}>
                {member.name} {member.name === "Clark" && <span className="text-[10px] text-[var(--gold)]">👑</span>}
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

      <div className="mb-4 flex flex-wrap gap-1">
        <button onClick={() => setAllocTab("master")} aria-label="Show master allocation list" aria-pressed={allocTab === "master"} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${allocTab === "master" ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`} style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Master
        </button>
        {members.map((member) => (
          <button key={member.name} onClick={() => setAllocTab(member.name)} aria-label={`Show allocations for ${member.name}`} aria-pressed={allocTab === member.name} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${allocTab === member.name ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`} style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {member.name}
          </button>
        ))}
      </div>

      <div className="thin-scrollbar max-h-[500px] overflow-y-auto rounded-lg">
        <table className="at">
          <thead>
            <tr><th>#</th><th>Date</th><th>Day</th><th>Time</th><th>Opponent</th><th>Owner</th><th>Source</th><th></th></tr>
          </thead>
          <tbody>
            {(allocTab === "master" ? sortedGames : sortedGames.filter((game) => allocationMap[game.game_number]?.assigned_to === allocTab)).map((game, index) => {
              const allocation = allocationMap[game.game_number];
              const owner = game.game_number === RESERVED_GAME_NUMBER ? "Reserved" : allocation?.assigned_to || "";
              const isEditing = editingGame === game.game_number;
              const logoUrl = getTeamLogoUrl(game.opponent);

              return (
                <tr key={game.id}>
                  <td className="text-white/30">{index + 1}</td>
                  <td>{formatGameDate(game.date)}</td>
                  <td>{game.day_of_week}</td>
                  <td>{game.start_time}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5">
                      {logoUrl ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded" style={{ backgroundColor: getTeamColor(game.opponent) }}>
                          <img src={logoUrl} alt="" className="h-4 w-4 object-contain" />
                        </span>
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getTeamColor(game.opponent) }} />
                      )}
                      {game.opponent}{game.game_number === RESERVED_GAME_NUMBER ? " ★" : ""}
                    </span>
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        {members.map((member) => (
                          <button
                            key={member.name}
                            onClick={() => reassignMutation.mutate({ gameNumber: game.game_number, newOwner: member.name })}
                            aria-label={`Assign game ${game.game_number} to ${member.name}`}
                            className="rounded-md px-2 py-0.5 text-[11px] font-medium transition hover:opacity-80"
                            style={{ fontFamily: "'Oswald', sans-serif", backgroundColor: `${member.accent_color}33`, color: member.accent_color }}
                          >
                            {member.name}
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
                          backgroundColor: owner === "Reserved" ? "rgba(191,160,72,0.15)" : `${memberColor(owner)}22`,
                          color: owner === "Reserved" ? "var(--gold)" : memberColor(owner)
                        }}
                      >
                        {owner}
                      </span>
                    )}
                  </td>
                  <td>
                    {allocation?.manually_assigned ? (
                      <span className="text-[10px] text-[#F59E0B]">MANUAL</span>
                    ) : allocation?.was_ranked ? (
                      <span className="text-[10px] text-white/30">Rank #{allocation.rank_position || "?"}</span>
                    ) : allocation ? (
                      <span className="text-[10px] text-white/20">Fallback</span>
                    ) : null}
                  </td>
                  <td>
                    {game.game_number !== RESERVED_GAME_NUMBER && allocation && !isFinalized && (
                      <button
                        onClick={() => setEditingGame(isEditing ? null : game.game_number)}
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