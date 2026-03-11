import React from "react";
import { computeAnalytics } from "./useAnalyticsData";
import MemberScorecards from "./MemberScorecards";
import MemberRankChart from "./MemberRankChart";
import HighDemandTable from "./HighDemandTable";
import TopMissedGames from "./TopMissedGames";

export default function AnalyticsDashboard({ members, games, submissions, allocations }) {
  const { memberStats, highDemandGames, gameMap } = computeAnalytics(
    members,
    games,
    submissions,
    allocations
  );

  const totalRankedSecured = memberStats.reduce((s, m) => s + m.gotFromRank.length, 0);
  const totalAllocated = memberStats.reduce((s, m) => s + m.totalAllocated, 0);
  const avgHitRate = memberStats.length > 0
    ? memberStats.reduce((s, m) => s + m.rankHitRate, 0) / memberStats.length
    : 0;

  return (
    <div className="mb-5 space-y-4">
      {/* Section Header */}
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-6">
        <h4
          className="mb-1 text-lg font-semibold text-[var(--gold)]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          📊 Preference Analytics
        </h4>
        <p className="mb-5 text-sm text-white/50">
          How well member preferences aligned with actual allocations
        </p>

        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Ranked Secured" value={totalRankedSecured} sub={`of ${totalAllocated} total`} />
          <SummaryCard label="Avg Hit Rate" value={`${Math.round(avgHitRate * 100)}%`} sub="ranked → allocated" />
          <SummaryCard label="Contested Games" value={highDemandGames.length} sub="ranked by 2+ members" />
          <SummaryCard
            label="Hot Game"
            value={highDemandGames[0]?.demandCount || 0}
            sub={highDemandGames[0]?.game?.opponent ? `vs ${highDemandGames[0].game.opponent}` : "—"}
          />
        </div>
      </div>

      {/* Member Scorecards */}
      <MemberScorecards memberStats={memberStats} />

      {/* Bar Chart */}
      <MemberRankChart memberStats={memberStats} />

      {/* High Demand Table */}
      <HighDemandTable highDemandGames={highDemandGames} />

      {/* Top Missed Picks */}
      <TopMissedGames memberStats={memberStats} gameMap={gameMap} />
    </div>
  );
}

function SummaryCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 text-center">
      <div
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[10px] font-medium text-white/35 uppercase"
        style={{ letterSpacing: "1px" }}
      >
        {label}
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-white/20">{sub}</div>}
    </div>
  );
}