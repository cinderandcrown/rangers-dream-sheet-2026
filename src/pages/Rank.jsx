import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AppToast from "@/components/rangers/AppToast";
import BrandHeader from "@/components/rangers/BrandHeader";
import FilterPills from "@/components/rangers/FilterPills";
import GameCard from "@/components/rangers/GameCard";
import RankedListPanel from "@/components/rangers/RankedListPanel";
import PullToRefresh from "@/components/rangers/PullToRefresh";
import useSeedData from "@/components/rangers/useSeedData";
import { DAY_OPTIONS, MONTH_OPTIONS } from "@/components/rangers/constants";
import { sortGames, sortMembers } from "@/components/rangers/utils";
import LoadingScreen from "@/components/rangers/LoadingScreen";
import GameDetailModal from "@/components/rangers/GameDetailModal";

function reorder(items, startIndex, endIndex) {
  const next = [...items];
  const [removed] = next.splice(startIndex, 1);
  next.splice(endIndex, 0, removed);
  return next;
}

export default function Rank() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const seedQuery = useSeedData();
  const urlParams = new URLSearchParams(window.location.search);
  const memberName = urlParams.get("memberName") || "";
  const memberEmail = urlParams.get("email") || "";

  const [monthFilter, setMonthFilter] = React.useState("All");
  const [dayFilter, setDayFilter] = React.useState("All");
  const [rankedGameIds, setRankedGameIds] = React.useState([]);
  const [toast, setToast] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);
  const [detailGame, setDetailGame] = React.useState(null);

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: () => base44.entities.Member.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const gamesQuery = useQuery({ queryKey: ["games"], queryFn: () => base44.entities.Game.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const submissionQuery = useQuery({ queryKey: ["submission", memberName], queryFn: () => base44.entities.Submission.filter({ member_name: memberName }), enabled: seedQuery.isSuccess && Boolean(memberName), initialData: [] });
  const allocationsQuery = useQuery({ queryKey: ["allocations"], queryFn: () => base44.entities.Allocation.list(), enabled: seedQuery.isSuccess, initialData: [] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = submissionQuery.data[0];
      const payload = { member_name: memberName, member_email: memberEmail || existing?.member_email || "", ranked_game_ids: rankedGameIds, submitted_at: new Date().toISOString(), is_final: false };
      if (existing) return base44.entities.Submission.update(existing.id, payload);
      return base44.entities.Submission.create(payload);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["submission", memberName] });
      const prev = queryClient.getQueryData(["submission", memberName]);
      queryClient.setQueryData(["submission", memberName], (old) => {
        const payload = { member_name: memberName, ranked_game_ids: rankedGameIds, submitted_at: new Date().toISOString() };
        return old?.[0] ? [{ ...old[0], ...payload }] : [payload];
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["submission", memberName], ctx.prev);
      setToast("Save failed — please try again");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submission", memberName] });
      setToast(`${memberName}'s rankings saved!`);
      setTimeout(() => { navigate(createPageUrl("Index")); }, 1200);
    },
  });

  const handleRefreshGames = async () => {
    await queryClient.refetchQueries({ queryKey: ["games"] });
  };

  React.useEffect(() => {
    if (!loaded && submissionQuery.data[0]?.ranked_game_ids) {
      setRankedGameIds(submissionQuery.data[0].ranked_game_ids);
      setLoaded(true);
    }
  }, [submissionQuery.data, loaded]);

  // Warn before leaving with unsaved changes
  React.useEffect(() => {
    const handler = (e) => {
      if (rankedGameIds.length > 0 && !saveMutation.isSuccess) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [rankedGameIds.length, saveMutation.isSuccess]);

  const member = sortMembers(membersQuery.data).find((item) => item.name === memberName);
  const games = sortGames(gamesQuery.data);
  const rankedGameSet = new Set(rankedGameIds);
  const rankedGames = rankedGameIds.map((n) => games.find((g) => g.game_number === n)).filter(Boolean);
  const filteredGames = games.filter((g) => (monthFilter === "All" || g.month === monthFilter) && (dayFilter === "All" || g.day_of_week === dayFilter));
  const progress = member ? Math.round((rankedGameIds.length / member.rank_max) * 100) : 0;

  // Email verification: if a submission already exists with an email, the incoming email must match
  const existingSubmission = submissionQuery.data[0];
  const emailMismatch = existingSubmission?.member_email && memberEmail && existingSubmission.member_email.toLowerCase() !== memberEmail.toLowerCase();

  if (seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || submissionQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <div className="mb-4 text-2xl font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>Member not found</div>
        <button onClick={() => navigate(createPageUrl("Index"))} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70">Back</button>
      </div>
    );
  }

  if (emailMismatch) {
    return (
      <div>
        <BrandHeader showBack onBack={() => navigate(createPageUrl("Index"))} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
          <div className="text-4xl mb-4">🚫</div>
          <div className="mb-2 text-2xl font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Email Doesn't Match</div>
          <p className="text-sm text-white/50 max-w-md">{member.name}'s Dream Sheet was submitted with a different email address. Please use the same email you originally signed in with.</p>
          <button onClick={() => navigate(createPageUrl("Index"))} className="mt-6 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white transition">Back to Home</button>
        </div>
      </div>
    );
  }

  const existingSub = submissionQuery.data[0];
  if (existingSub?.is_locked) {
    return (
      <div>
        <BrandHeader showBack onBack={() => navigate(createPageUrl("Index"))} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
          <div className="text-4xl mb-4">🔒</div>
          <div className="mb-2 text-2xl font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Submission Locked</div>
          <p className="text-sm text-white/50 max-w-md">{member.name}'s submission has been locked by the admin. Contact Clark if you need to make changes.</p>
          <button onClick={() => navigate(createPageUrl("Index"))} className="mt-6 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white transition">Back to Home</button>
        </div>
      </div>
    );
  }

  const addGame = (game) => {
    if (rankedGameSet.has(game.game_number)) return;
    if (rankedGameIds.length >= member.rank_max) { setToast(`Maximum ${member.rank_max} rankings reached!`); return; }
    setRankedGameIds((prev) => [...prev, game.game_number]);
  };

  const moveItem = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= rankedGameIds.length) return;
    setRankedGameIds((prev) => reorder(prev, idx, target));
  };

  return (
    <div>
      <BrandHeader showBack onBack={() => {
        if (rankedGameIds.length > 0 && !saveMutation.isSuccess) {
          if (!window.confirm("You have unsaved rankings. Leave anyway?")) return;
        }
        navigate(createPageUrl("Index"));
      }} />
      <div className="relative z-[1] mx-auto max-w-[1200px] px-3 sm:px-6 py-4 sm:py-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3
              className="text-xl font-semibold"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", color: member.accent_color }}
            >
              {member.name}'s Dream Sheet
            </h3>
            <p className="mt-0.5 text-sm text-white/50">Click games to rank them (1 = most wanted). Drag to reorder.</p>
            {new Date() > new Date("2026-03-18T23:59:59") && (
              <p className="mt-1 text-[12px] text-[#EAB308]" style={{ fontFamily: "'Oswald', sans-serif" }}>
                ⏰ The deadline was March 18th, but your submission will still be recorded.
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[var(--slate)] px-3 sm:px-5 py-[10px]">
              <div className="h-2 w-24 sm:w-40 overflow-hidden rounded-lg bg-white/[0.08]">
                <div
                  className="h-full rounded-lg transition-all duration-400"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: progress >= 100 ? "#22C55E" : `linear-gradient(90deg, ${member.accent_color}, var(--gold))`
                  }}
                />
              </div>
              <span className="whitespace-nowrap text-[15px] font-medium" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {rankedGameIds.length} / {member.rank_max}
              </span>
            </div>
            <p className="text-[12px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif" }}>
              {rankedGameIds.length === 0
                ? "Tap any game below to start"
                : progress >= 100
                  ? "All set! Review your list and submit 👇"
                  : progress >= 75
                    ? `Almost done — just ${member.rank_max - rankedGameIds.length} left!`
                    : progress >= 50
                      ? "Over halfway! Keep it rolling"
                      : progress >= 25
                        ? `Nice — you're ${progress}% there`
                        : `Great start! ${member.rank_max - rankedGameIds.length} more to go`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto thin-scrollbar">
          <FilterPills options={["All", ...["April", "May", "June", "July", "August", "September"]]} activeValue={monthFilter} onChange={setMonthFilter} games={games} countKey="month" />
          <span className="w-2" />
          <FilterPills options={DAY_OPTIONS} activeValue={dayFilter} onChange={setDayFilter} games={games} countKey="day_of_week" />
        </div>

        {/* Two column layout */}
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          {/* Game grid */}
          <PullToRefresh onRefresh={handleRefreshGames}>
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2 sm:gap-[10px]">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                rankNumber={rankedGameIds.indexOf(game.game_number) + 1 || null}
                onSelect={addGame}
                onInfoClick={setDetailGame}
              />
            ))}
          </div>
          </PullToRefresh>

          {/* Ranked list */}
          <div className="max-lg:order-first">
            <RankedListPanel
              games={rankedGames}
              onDragEnd={(result) => {
                if (!result.destination) return;
                setRankedGameIds((prev) => reorder(prev, result.source.index, result.destination.index));
              }}
              onMoveUp={(idx) => moveItem(idx, "up")}
              onMoveDown={(idx) => moveItem(idx, "down")}
              onRemove={(gn) => setRankedGameIds((prev) => prev.filter((id) => id !== gn))}
              onClear={() => setRankedGameIds([])}
              onSubmit={() => saveMutation.mutate()}
              disabled={rankedGameIds.length === 0 || saveMutation.isPending}
              isPending={saveMutation.isPending}
            />
          </div>
        </div>
      </div>
      <AppToast toast={toast} onClose={() => setToast("")} />
      {detailGame && (
        <GameDetailModal
          game={detailGame}
          allocation={allocationsQuery.data.find((a) => a.game_number === detailGame.game_number)}
          members={sortMembers(membersQuery.data)}
          onClose={() => setDetailGame(null)}
        />
      )}
    </div>
  );
}