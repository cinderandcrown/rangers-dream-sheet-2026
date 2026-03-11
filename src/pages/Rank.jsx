import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import FilterPills from "@/components/rangers/FilterPills";
import GameCard from "@/components/rangers/GameCard";
import RankedListPanel from "@/components/rangers/RankedListPanel";
import useSeedData from "@/components/rangers/useSeedData";
import { DAY_OPTIONS, MONTH_OPTIONS } from "@/components/rangers/constants";
import { sortGames, sortMembers } from "@/components/rangers/utils";

function reorder(items, startIndex, endIndex) {
  const next = [...items];
  const [removed] = next.splice(startIndex, 1);
  next.splice(endIndex, 0, removed);
  return next;
}

export default function Rank() {
  const queryClient = useQueryClient();
  const seedQuery = useSeedData();
  const urlParams = new URLSearchParams(window.location.search);
  const memberName = urlParams.get("memberName") || "";

  const [monthFilter, setMonthFilter] = React.useState("All");
  const [dayFilter, setDayFilter] = React.useState("All");
  const [rankedGameIds, setRankedGameIds] = React.useState([]);
  const [toast, setToast] = React.useState("");

  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: () => base44.entities.Member.list(),
    enabled: seedQuery.isSuccess,
    initialData: [],
  });

  const gamesQuery = useQuery({
    queryKey: ["games"],
    queryFn: () => base44.entities.Game.list(),
    enabled: seedQuery.isSuccess,
    initialData: [],
  });

  const submissionQuery = useQuery({
    queryKey: ["submission", memberName],
    queryFn: () => base44.entities.Submission.filter({ member_name: memberName }),
    enabled: seedQuery.isSuccess && Boolean(memberName),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = submissionQuery.data[0];
      const payload = {
        member_name: memberName,
        ranked_game_ids: rankedGameIds,
        submitted_at: new Date().toISOString(),
        is_final: false,
      };

      if (existing) {
        return base44.entities.Submission.update(existing.id, payload);
      }
      return base44.entities.Submission.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submission", memberName] });
      setToast(`${memberName}'s rankings saved!`);
      window.setTimeout(() => {
        window.location.href = createPageUrl("Index");
      }, 1200);
    },
  });

  React.useEffect(() => {
    if (submissionQuery.data[0]?.ranked_game_ids) {
      setRankedGameIds(submissionQuery.data[0].ranked_game_ids);
    }
  }, [submissionQuery.data]);

  const member = sortMembers(membersQuery.data).find((item) => item.name === memberName);
  const games = sortGames(gamesQuery.data);
  const rankedGameSet = new Set(rankedGameIds);
  const rankedGames = rankedGameIds.map((gameNumber) => games.find((game) => game.game_number === gameNumber)).filter(Boolean);
  const filteredGames = games.filter((game) => (monthFilter === "All" || game.month === monthFilter) && (dayFilter === "All" || game.day_of_week === dayFilter));
  const progress = member ? Math.min((rankedGameIds.length / member.rank_max) * 100, 100) : 0;

  if (seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || submissionQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-xl text-white/80 oswald">Loading rankings…</div>;
  }

  if (!member) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="text-3xl text-white oswald">Member not found</div>
        <button onClick={() => { window.location.href = createPageUrl("Index"); }} className="mt-6 min-h-[44px] rounded-full border border-white/10 px-5 text-white/75">
          Back to home
        </button>
      </div>
    );
  }

  const addGame = (game) => {
    if (rankedGameSet.has(game.game_number)) return;
    if (rankedGameIds.length >= member.rank_max) {
      setToast(`Maximum ${member.rank_max} rankings reached!`);
      return;
    }
    setRankedGameIds((current) => [...current, game.game_number]);
  };

  const moveItem = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rankedGameIds.length) return;
    setRankedGameIds((current) => reorder(current, index, targetIndex));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => { window.location.href = createPageUrl("Index"); }} className="mb-5 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-white/75 transition hover:bg-white/5">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl oswald" style={{ color: member.accent_color }}>{member.name} Dream Sheet</h1>
            <p className="mt-2 text-white/70">Click games to rank them (1 = most wanted). Drag to reorder your list.</p>
          </div>
          <div className="w-full max-w-md rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] p-1.5">
            <div className="mb-2 flex items-center justify-between px-3 text-sm font-semibold text-white/70">
              <span>Progress</span>
              <span>{rankedGameIds.length} / {member.rank_max}</span>
            </div>
            <div className="h-3 rounded-full bg-white/10">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: progress >= 100 ? "#22C55E" : `linear-gradient(90deg, ${member.accent_color}, #BFA048)`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
        <FilterPills label="Month" options={MONTH_OPTIONS} activeValue={monthFilter} onChange={setMonthFilter} />
        <FilterPills label="Day" options={DAY_OPTIONS} activeValue={dayFilter} onChange={setDayFilter} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              rankNumber={rankedGameIds.indexOf(game.game_number) + 1 || null}
              maxReached={rankedGameIds.length >= member.rank_max}
              onSelect={addGame}
            />
          ))}
        </section>

        <RankedListPanel
          games={rankedGames}
          onDragEnd={(result) => {
            if (!result.destination) return;
            setRankedGameIds((current) => reorder(current, result.source.index, result.destination.index));
          }}
          onMoveUp={(index) => moveItem(index, "up")}
          onMoveDown={(index) => moveItem(index, "down")}
          onRemove={(gameNumber) => setRankedGameIds((current) => current.filter((id) => id !== gameNumber))}
          onClear={() => setRankedGameIds([])}
          onSubmit={() => saveMutation.mutate()}
          disabled={rankedGameIds.length === 0 || saveMutation.isPending}
        />
      </div>

      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}