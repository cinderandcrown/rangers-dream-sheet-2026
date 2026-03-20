import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import SubgroupMemberManager from "./SubgroupMemberManager";
import SubgroupGameDraftRow from "./SubgroupGameDraftRow";

export default function SubgroupDraftPanel({ managerName, games, members, picks, onToast }) {
  const queryClient = useQueryClient();

  const refreshDraft = () => {
    queryClient.invalidateQueries({ queryKey: ["subgroupMembers"] });
    queryClient.invalidateQueries({ queryKey: ["subgroupPicks"] });
  };

  const handleAssign = async (game, value) => {
    const existingPick = picks.find((pick) => pick.game_number === game.game_number);

    if (value === "unassigned") {
      if (!existingPick) return;
      await base44.entities.SubgroupPick.delete(existingPick.id);
      refreshDraft();
      onToast(`Removed ${game.opponent} from the subgroup draft`);
      return;
    }

    if (existingPick) {
      await base44.entities.SubgroupPick.update(existingPick.id, {
        subgroup_member_name: value,
      });
    } else {
      await base44.entities.SubgroupPick.create({
        manager_name: managerName,
        subgroup_member_name: value,
        game_number: game.game_number,
        pick_order: picks.length + 1,
      });
    }

    refreshDraft();
    onToast(`${game.opponent} assigned to ${value}`);
  };

  return (
    <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-[18px] font-bold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
          {managerName} Subgroup Draft
        </h2>
        <p className="mt-2 text-[13px] text-white/50">
          Manage your subgroup here using only your assigned group games. Set the turn order, then assign each game to someone in your subgroup.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/[0.05] px-3 py-3 text-center">
          <div className="text-[18px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>{members.length}</div>
          <div className="text-[10px] text-white/45" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>Members</div>
        </div>
        <div className="rounded-xl bg-white/[0.05] px-3 py-3 text-center">
          <div className="text-[18px] font-bold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif" }}>{picks.length}</div>
          <div className="text-[10px] text-white/45" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>Drafted</div>
        </div>
        <div className="rounded-xl bg-white/[0.05] px-3 py-3 text-center">
          <div className="text-[18px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>{games.length - picks.length}</div>
          <div className="text-[10px] text-white/45" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>Open</div>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
          Turn Order
        </div>
        <SubgroupMemberManager managerName={managerName} members={members} picks={picks} onRefresh={refreshDraft} onToast={onToast} />
      </div>

      <div>
        <div className="mb-2 text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
          Assign Games
        </div>
        <div className="space-y-3">
          {games.map((game) => (
            <SubgroupGameDraftRow
              key={game.game_number}
              game={game}
              currentPick={picks.find((pick) => pick.game_number === game.game_number) || null}
              members={members}
              onAssign={handleAssign}
            />
          ))}
        </div>
      </div>
    </div>
  );
}