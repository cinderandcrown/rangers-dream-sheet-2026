import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Download } from "lucide-react";
import SubgroupMemberManager from "./SubgroupMemberManager";
import SubgroupGameDraftRow from "./SubgroupGameDraftRow";
import SubgroupDrawingOrderPanel from "./SubgroupDrawingOrderPanel";
import SubgroupScheduleDistribution from "./SubgroupScheduleDistribution";
import { downloadSubgroupExcel } from "./subgroupExports";
import { SANDY_DRAWING_ORDER_OPTIONS } from "./sandyDrawingOrder";

export default function SubgroupDraftPanel({ managerName, games, members, picks, onToast }) {
  const queryClient = useQueryClient();
  const isSandyDraft = managerName === "Sandy";
  const isFinalized = picks.length > 0 && picks.every((pick) => pick.is_finalized);
  const allAssigned = games.length > 0 && games.every((game) => picks.some((pick) => pick.game_number === game.game_number));

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

    const [pickOrderValue, subgroupMemberValue] = isSandyDraft ? value.split("::") : [null, value];
    const subgroupMemberName = subgroupMemberValue || value;
    const nextPickOrder = isSandyDraft ? Number(pickOrderValue) : (existingPick?.pick_order || (picks.length + 1));

    if (existingPick) {
      await base44.entities.SubgroupPick.update(existingPick.id, {
        subgroup_member_name: subgroupMemberName,
        pick_order: nextPickOrder,
        is_finalized: false,
      });
    } else {
      await base44.entities.SubgroupPick.create({
        manager_name: managerName,
        subgroup_member_name: subgroupMemberName,
        game_number: game.game_number,
        pick_order: nextPickOrder,
        is_finalized: false,
      });
    }

    refreshDraft();
    onToast(`${game.opponent} assigned to ${subgroupMemberName}`);
  };

  const handleSubmitDraft = async () => {
    await Promise.all(
      picks.map((pick) => base44.entities.SubgroupPick.update(pick.id, { is_finalized: true }))
    );
    refreshDraft();
    onToast(`${managerName}'s subgroup draft was submitted`);
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
        {isFinalized && (
          <div className="mt-3 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 px-4 py-3 text-[12px] text-[#86EFAC]">
            Subgroup draft locked in — your schedule below now shows who each game belongs to, and you can download the Excel sheet to share with the subgroup.
          </div>
        )}
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

      {isSandyDraft && <SubgroupDrawingOrderPanel />}

      {!isSandyDraft && (
        <div className="mb-5">
          <div className="mb-2 text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
            Turn Order
          </div>
          <SubgroupMemberManager managerName={managerName} members={members} picks={picks} onRefresh={refreshDraft} onToast={onToast} disabled={isFinalized} />
        </div>
      )}

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
              options={isSandyDraft ? SANDY_DRAWING_ORDER_OPTIONS : undefined}
              useDrawingOrder={isSandyDraft}
              onAssign={handleAssign}
              disabled={isFinalized}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {isFinalized && (
          <button
            onClick={() => downloadSubgroupExcel(managerName, games, picks)}
            aria-label="Download subgroup draft as Excel"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-[12px] font-semibold text-white/80 transition hover:bg-white/[0.08]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            <Download className="h-4 w-4" />
            Download Excel
          </button>
        )}
        <button
          onClick={handleSubmitDraft}
          disabled={isFinalized || picks.length === 0}
          aria-label="Lock in subgroup draft"
          className="btn-red-gradient min-h-[48px] rounded-xl px-5 py-3 text-[12px] font-semibold text-white disabled:opacity-40"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          {isFinalized ? "Subgroup Draft Locked In" : (allAssigned ? "Lock In Subgroup Draft" : "Lock In Current Assignments") }
        </button>
      </div>

      {isFinalized && (
        <SubgroupScheduleDistribution
          managerName={managerName}
          games={games}
          picks={picks}
        />
      )}
    </div>
  );
}