import { DRAFTABLE_GAME_COUNT, OUTLOOK_LOCATION, RESERVED_GAME_NUMBER } from "./constants";
import { addHoursToTime, csvEscape, downloadCsv, formatGameDate, formatOutlookDate, sortGames } from "./utils";

export function calculateTargets(allMembers) {
  // Targets are always the fixed share_count for each member — never recalculated proportionally.
  return allMembers.reduce((acc, member) => ({ ...acc, [member.name]: member.share_count }), {});
}

export function buildAllocationPlan(games, members, submissions) {
  const gamesByNumber = Object.fromEntries(games.map((game) => [game.game_number, game]));
  const draftableGames = sortGames(games).filter((game) => game.game_number !== RESERVED_GAME_NUMBER);
  const submissionMap = Object.fromEntries(submissions.map((submission) => [submission.member_name, submission]));

  // ALL members participate in the draft — sorted: Clark first, then by share count descending
  const allMembers = [...members].sort((a, b) => {
    if (a.name === "Clark") return -1;
    if (b.name === "Clark") return 1;
    return b.share_count - a.share_count;
  });

  // Targets are always the fixed share_count (George=32, Sandy=24, Clark=9, Chase=8, Ed=7)
  const targets = calculateTargets(allMembers);
  const counts = Object.fromEntries(allMembers.map((member) => [member.name, 0]));
  const pointers = Object.fromEntries(allMembers.map((member) => [member.name, 0]));
  const allocations = [];
  const assignedGameNumbers = new Set();

  let safetyLimit = DRAFTABLE_GAME_COUNT * 2;
  while (allocations.length < DRAFTABLE_GAME_COUNT && safetyLimit > 0) {
    safetyLimit -= 1;
    let madeProgress = false;

    for (const member of allMembers) {
      if (allocations.length >= DRAFTABLE_GAME_COUNT) break;
      if (counts[member.name] >= targets[member.name]) continue;

      // Try to assign from this member's ranked preferences (if they submitted)
      const rankedIds = submissionMap[member.name]?.ranked_game_ids || [];
      let assignedFromRank = null;

      while (pointers[member.name] < rankedIds.length) {
        const gameNumber = rankedIds[pointers[member.name]];
        pointers[member.name] += 1;
        if (gameNumber === RESERVED_GAME_NUMBER || assignedGameNumbers.has(gameNumber)) continue;
        assignedFromRank = { gameNumber, was_ranked: true, rank_position: pointers[member.name] };
        break;
      }

      // Fallback: next available unassigned draftable game
      const fallbackGame = draftableGames.find((game) => !assignedGameNumbers.has(game.game_number));
      const selection = assignedFromRank || (fallbackGame ? { gameNumber: fallbackGame.game_number, was_ranked: false } : null);
      if (!selection) continue;

      assignedGameNumbers.add(selection.gameNumber);
      counts[member.name] += 1;
      madeProgress = true;
      allocations.push({
        game_number: selection.gameNumber,
        assigned_to: member.name,
        was_ranked: selection.was_ranked,
        ...(selection.rank_position ? { rank_position: selection.rank_position } : {})
      });
    }

    if (!madeProgress) break;
  }

  return {
    allocations,
    counts,
    targets,
    gamesByNumber,
    allMembers,
  };
}

export function downloadMasterScheduleCsv(games, allocations) {
  const ownerByGame = Object.fromEntries(allocations.map((allocation) => [allocation.game_number, allocation.assigned_to]));
  const rows = [
    ["Date", "Day", "Time", "Opponent", "Owner"],
    ...sortGames(games).map((game) => [
      formatGameDate(game.date),
      game.day_of_week,
      game.start_time,
      game.opponent,
      game.game_number === RESERVED_GAME_NUMBER ? "Reserved" : ownerByGame[game.game_number] || ""
    ])
  ];

  downloadCsv(
    "rangers-dream-sheet-master.csv",
    rows.map((row) => row.map(csvEscape).join(",")).join("\n")
  );
}

export function downloadMemberScheduleCsv(memberName, games, allocations) {
  const gameNumbers = allocations.filter((allocation) => allocation.assigned_to === memberName).map((allocation) => allocation.game_number);
  const assignedGames = sortGames(games).filter((game) => gameNumbers.includes(game.game_number));
  const rows = [
    ["Subject", "Start Date", "Start Time", "End Date", "End Time", "Location", "Description"],
    ...assignedGames.map((game) => [
      `${game.opponent} at Rangers`,
      formatOutlookDate(game.date),
      game.start_time,
      formatOutlookDate(game.date),
      addHoursToTime(game.start_time, 3.5),
      OUTLOOK_LOCATION,
      `Texas Rangers vs ${game.opponent} — Season Ticket Game (${memberName}'s allocation)`
    ])
  ];

  downloadCsv(
    `${memberName.toLowerCase()}-rangers-games.csv`,
    rows.map((row) => row.map(csvEscape).join(",")).join("\n")
  );
}