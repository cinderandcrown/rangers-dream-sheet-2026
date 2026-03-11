import { RESERVED_GAME_NUMBER } from "../constants";

export function computeAnalytics(members, games, submissions, allocations) {
  const gameMap = Object.fromEntries(games.map((g) => [g.game_number, g]));
  const allocationMap = Object.fromEntries(allocations.map((a) => [a.game_number, a.assigned_to]));
  const submissionMap = Object.fromEntries(submissions.map((s) => [s.member_name, s]));

  // Per-member analysis
  const memberStats = members.map((m) => {
    const sub = submissionMap[m.name];
    const ranked = sub?.ranked_game_ids || [];
    const allocated = allocations
      .filter((a) => a.assigned_to === m.name)
      .map((a) => a.game_number);
    const allocatedSet = new Set(allocated);

    // Which ranked games did they actually get?
    const gotFromRank = [];
    const missedFromRank = [];
    ranked.forEach((gn, idx) => {
      if (allocatedSet.has(gn)) {
        gotFromRank.push({ game_number: gn, rank: idx + 1 });
      } else {
        missedFromRank.push({ game_number: gn, rank: idx + 1 });
      }
    });

    // Top-5 / Top-10 hit rates
    const top5 = ranked.slice(0, 5);
    const top10 = ranked.slice(0, 10);
    const top5Hits = top5.filter((gn) => allocatedSet.has(gn)).length;
    const top10Hits = top10.filter((gn) => allocatedSet.has(gn)).length;

    // Unranked games they received (fallback assignments)
    const unrankedAllocated = allocated.filter((gn) => !ranked.includes(gn));

    return {
      name: m.name,
      accent_color: m.accent_color,
      totalRanked: ranked.length,
      totalAllocated: allocated.length,
      gotFromRank,
      missedFromRank,
      top5Hits,
      top5Total: top5.length,
      top10Hits,
      top10Total: top10.length,
      rankHitRate: ranked.length > 0 ? gotFromRank.length / ranked.length : 0,
      unrankedCount: unrankedAllocated.length,
    };
  });

  // High-demand games: ranked by multiple members but only one got it
  const gameRankCounts = {};
  const gameRankers = {};
  members.forEach((m) => {
    const sub = submissionMap[m.name];
    const ranked = sub?.ranked_game_ids || [];
    ranked.forEach((gn, idx) => {
      if (gn === RESERVED_GAME_NUMBER) return;
      gameRankCounts[gn] = (gameRankCounts[gn] || 0) + 1;
      if (!gameRankers[gn]) gameRankers[gn] = [];
      gameRankers[gn].push({ name: m.name, rank: idx + 1, color: m.accent_color });
    });
  });

  const highDemandGames = Object.entries(gameRankCounts)
    .filter(([, count]) => count >= 2)
    .map(([gn, count]) => {
      const gameNum = Number(gn);
      const game = gameMap[gameNum];
      const winner = allocationMap[gameNum];
      const rankers = gameRankers[gameNum] || [];
      const missedBy = rankers.filter((r) => r.name !== winner);
      return {
        game_number: gameNum,
        game,
        demandCount: count,
        winner,
        winnerRank: rankers.find((r) => r.name === winner)?.rank,
        rankers,
        missedBy,
      };
    })
    .sort((a, b) => b.demandCount - a.demandCount || a.game_number - b.game_number);

  return { memberStats, highDemandGames, gameMap };
}