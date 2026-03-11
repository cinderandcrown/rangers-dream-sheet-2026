import { DRAFTABLE_GAME_COUNT, OUTLOOK_LOCATION, RESERVED_GAME_NUMBER } from "./constants";
import { addHoursToTime, csvEscape, downloadCsv, formatGameDate, formatOutlookDate, sortGames } from "./utils";

export function calculateTargets(submittedMembers) {
  const totalShares = submittedMembers.reduce((sum, member) => sum + member.share_count, 0);
  const ordered = [...submittedMembers].sort((a, b) => b.share_count - a.share_count);
  const targets = ordered.map((member) => ({
    name: member.name,
    target: Math.round((member.share_count / totalShares) * DRAFTABLE_GAME_COUNT),
    share_count: member.share_count,
  }));

  let difference = DRAFTABLE_GAME_COUNT - targets.reduce((sum, item) => sum + item.target, 0);
  let index = 0;

  while (difference !== 0 && targets.length > 0) {
    const current = targets[index % targets.length];
    if (difference > 0) {
      current.target += 1;
      difference -= 1;
    } else if (current.target > 0) {
      current.target -= 1;
      difference += 1;
    }
    index += 1;
  }

  return targets.reduce((acc, item) => ({ ...acc, [item.name]: item.target }), {});
}

export function buildAllocationPlan(games, members, submissions) {
  const gamesByNumber = Object.fromEntries(games.map((game) => [game.game_number, game]));
  const draftableGames = sortGames(games).filter((game) => game.game_number !== RESERVED_GAME_NUMBER);
  const submittedMembers = members
    .filter((member) => submissions.some((submission) => submission.member_name === member.name))
    .sort((a, b) => b.share_count - a.share_count);

  const targets = calculateTargets(submittedMembers);
  const counts = Object.fromEntries(submittedMembers.map((member) => [member.name, 0]));
  const pointers = Object.fromEntries(submittedMembers.map((member) => [member.name, 0]));
  const allocations = [];
  const assignedGameNumbers = new Set();
  const submissionMap = Object.fromEntries(submissions.map((submission) => [submission.member_name, submission]));

  while (allocations.length < DRAFTABLE_GAME_COUNT && submittedMembers.length > 0) {
    for (const member of submittedMembers) {
      if (allocations.length >= DRAFTABLE_GAME_COUNT) break;
      if (counts[member.name] >= targets[member.name]) continue;

      const rankedIds = submissionMap[member.name]?.ranked_game_ids || [];
      let assignedFromRank = null;

      while (pointers[member.name] < rankedIds.length) {
        const gameNumber = rankedIds[pointers[member.name]];
        pointers[member.name] += 1;
        if (gameNumber === RESERVED_GAME_NUMBER || assignedGameNumbers.has(gameNumber)) continue;
        assignedFromRank = { gameNumber, was_ranked: true, rank_position: pointers[member.name] };
        break;
      }

      const fallbackGame = draftableGames.find((game) => !assignedGameNumbers.has(game.game_number));
      const selection = assignedFromRank || (fallbackGame ? { gameNumber: fallbackGame.game_number, was_ranked: false } : null);
      if (!selection) continue;

      assignedGameNumbers.add(selection.gameNumber);
      counts[member.name] += 1;
      allocations.push({
        game_number: selection.gameNumber,
        assigned_to: member.name,
        was_ranked: selection.was_ranked,
        ...(selection.rank_position ? { rank_position: selection.rank_position } : {})
      });
    }
  }

  return {
    allocations,
    counts,
    targets,
    gamesByNumber,
    submittedMembers,
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