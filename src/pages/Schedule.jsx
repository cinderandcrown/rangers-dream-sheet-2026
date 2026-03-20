import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useTabNavigation } from "@/lib/TabNavigationContext";
import BrandHeader from "@/components/rangers/BrandHeader";
import LoadingScreen from "@/components/rangers/LoadingScreen";
import ScheduleMonthCard from "@/components/rangers/ScheduleMonthCard";
import ScheduleStats from "@/components/rangers/ScheduleStats";
import { getMemberScheduleData } from "@/components/rangers/scheduleExports";
import { sortGames, sortMembers } from "@/components/rangers/utils";
import { Printer } from "lucide-react";
import GameDetailModal from "@/components/rangers/GameDetailModal";

export default function Schedule() {
  const { pop } = useTabNavigation();
  const urlParams = new URLSearchParams(window.location.search);
  const memberName = urlParams.get("memberName");
  const [selectedGame, setSelectedGame] = React.useState(null);

  const gamesQuery = useQuery({ queryKey: ["games"], queryFn: () => base44.entities.Game.list(), initialData: [] });
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: () => base44.entities.Member.list(), initialData: [] });
  const allocationsQuery = useQuery({ queryKey: ["allocations"], queryFn: () => base44.entities.Allocation.list(), initialData: [] });

  if (gamesQuery.isLoading || membersQuery.isLoading || allocationsQuery.isLoading) {
    return <LoadingScreen />;
  }

  const allocations = allocationsQuery.data;
  const games = sortGames(gamesQuery.data);
  const members = sortMembers(membersQuery.data);
  const member = members.find((m) => m.name === memberName);

  if (allocations.length === 0) {
    return (
      <div>
        <BrandHeader showBack onBack={() => pop("/Admin")} />
        <div className="mx-auto max-w-[740px] px-6 py-16 text-center">
          <div className="text-[48px] mb-4">📋</div>
          <h2 className="text-xl font-bold text-white/80 mb-2" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
            No Allocations Yet
          </h2>
          <p className="text-white/50">Run the allocation first from the Admin Dashboard.</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <BrandHeader showBack onBack={() => pop("/Admin")} />
        <div className="mx-auto max-w-[740px] px-6 py-16 text-center">
          <p className="text-white/50">Member "{memberName}" not found.</p>
        </div>
      </div>
    );
  }

  const memberGames = getMemberScheduleData(memberName, games, allocations);

  // Group by month
  const monthGroups = {};
  memberGames.forEach((g) => {
    if (!monthGroups[g.month]) monthGroups[g.month] = [];
    monthGroups[g.month].push(g);
  });
  const monthOrder = ["April", "May", "June", "July", "August", "September"];
  const orderedMonths = monthOrder.filter((m) => monthGroups[m]);

  return (
    <div className="schedule-page">
      <BrandHeader showBack onBack={() => pop("/Admin")} />

      <div className="relative z-[1] mx-auto max-w-[740px] px-6 py-8">
        {/* Header banner */}
        <div
          className="mb-7 overflow-hidden rounded-[14px] px-8 py-7"
          style={{
            background: "#003278",
            borderLeft: `6px solid ${member.accent_color}`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-[26px] font-bold text-white sm:text-[32px]"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}
              >
                {member.name}'s 2026 Rangers Schedule
              </h1>
              <p className="mt-1 text-[14px] text-white/70">
                {memberGames.length} Games at Globe Life Field
              </p>
            </div>
            <button
              onClick={() => window.print()}
              aria-label={`Print ${member.name}'s schedule`}
              className="flex-shrink-0 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-white/20"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              <Printer className="mr-1.5 inline h-3.5 w-3.5" />
              Print
            </button>
          </div>
        </div>

        {/* Month cards */}
        {orderedMonths.map((month) => (
          <ScheduleMonthCard key={month} month={month} games={monthGroups[month]} onGameClick={setSelectedGame} />
        ))}

        {/* Game Detail Modal */}
        {selectedGame && (
          <GameDetailModal
            game={selectedGame}
            allocation={allocations.find((a) => a.game_number === selectedGame.game_number)}
            members={members}
            onClose={() => setSelectedGame(null)}
          />
        )}

        {/* Stats */}
        <ScheduleStats games={memberGames} />

        {/* Back link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => pop("/Admin")}
            aria-label="Back to admin dashboard"
            className="text-[12px] text-white/30 underline underline-offset-2 transition hover:text-white/50"
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}