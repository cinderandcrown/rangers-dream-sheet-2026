import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { GAME_SEED_DATA, MEMBER_SEED_DATA } from "./constants";

async function ensureSeedData() {
  const [games, members] = await Promise.all([
    base44.entities.Game.list(),
    base44.entities.Member.list()
  ]);

  const existingGameNumbers = new Set(games.map((game) => game.game_number));
  const existingMemberNames = new Set(members.map((member) => member.name));

  const missingGames = GAME_SEED_DATA.filter((game) => !existingGameNumbers.has(game.game_number));
  const missingMembers = MEMBER_SEED_DATA.filter((member) => !existingMemberNames.has(member.name));

  if (missingGames.length > 0) {
    await base44.entities.Game.bulkCreate(missingGames);
  }

  if (missingMembers.length > 0) {
    await base44.entities.Member.bulkCreate(missingMembers);
  }

  return true;
}

export default function useSeedData() {
  return useQuery({
    queryKey: ["rangers-seed-data"],
    queryFn: ensureSeedData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}