import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
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
  const [loaded, setLoaded] = React.useState(false);

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
    if (!loaded && submissionQuery.data[0]?.ranked_game_ids) {
      setRankedGameIds(submissionQuery.data[0].ranked_game_ids);
      setLoaded(true);
    }
  }, [submissionQuery.data, loaded]);

  const member = sortMembers(membersQuery.data).find((item) => item.name === memberName);
  const games = sortGames(gamesQuery.data);
  const rankedGameSet = new Set(rankedGameIds);
  const rankedGames = rankedGameIds.map((gameNumber) => games.find((game) => game.game_number === gameNumber)).filter(Boolean);
  const filteredGames = games.filter((game) => (monthFilter === "All" || game.month === monthFilter) && (dayFilter === "All" || game.day_of_week === dayFilter));
  const progress = member ? Math.min((rankedGameIds.length / member.rank_max) * 100, 100) : 0;

  if (seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || submissionQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--gold)]/20 border-t-[var(--gold)]" />
        <span className="text-lg text-white/60 oswald">Loading rankings…</span>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="text-3xl text-white oswald">Member not found</div>
        <button onClick={() => { window.location.href = createPageUrl("Index"); }} className="mt-6 min-h-[44px] rounded-xl border border-white/10 px-5 text-white/75">
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
    <div className="min-h-screen">
      <BrandHeader showBack onBack={() => { window.location.href = createPageUrl("Index"); }} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Member header + progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-panel p-5"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white oswald"
                  style={{ background: `linear-gradient(135deg, ${member.accent_color}, ${member.accent_color}CC)` }}
                >
                  {member.name.slice(0, 1)}
                </div>
                <h1 className="text-3xl text-white oswald sm:text-4xl" style={{ color: member.accent_color }}>
                  {member.name}&apos;s Dream Sheet
                </h1>
              </div>
              <p className="mt-2 text-sm text-white/55">Click games to rank them (1 = most wanted). Drag to reorder your list.</p>
            </div>

            {/* Progress pill */}
            <div className="w-full max-w-sm">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-white/40 oswald">Progress</span>
                <span className="text-white/70">{rankedGameIds.length} <span className="text-white/30">/ {member.rank_max}</span></span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    background: progress >= 100 ? "linear-gradient(90deg, #22C55E, #16A34A)" : `linear-gradient(90deg, ${member.accent_color}, #BFA048)`
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="section-panel mt-5 space-y-3 p-4"
        >
          <FilterPills label="Month" options={MONTH_OPTIONS} activeValue={monthFilter} onChange={setMonthFilter} />
          <FilterPills label="Day" options={DAY_OPTIONS} activeValue={dayFilter} onChange={setDayFilter} />
        </motion.div>

        {/* Two-column layout */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3"
          >
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                rankNumber={rankedGameIds.indexOf(game.game_number) + 1 || null}
                maxReached={rankedGameIds.length >= member.rank_max}
                onSelect={addGame}
              />
            ))}
          </motion.section>

          <RankedListPanel
            games={rankedGames}
            memberColor={member.accent_color}
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
            isPending={saveMutation.isPending}
          />
        </div>
      </div>

      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}