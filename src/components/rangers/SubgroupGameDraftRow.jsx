import React from "react";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubgroupGameDraftRow({ game, currentPick, members, onAssign, disabled = false, options, useDrawingOrder = false }) {
  const gameDate = format(parseISO(game.date), "EEE, MMM d");
  const selectOptions = options || members.map((member) => ({
    value: member.member_name,
    label: `${member.pick_order}. ${member.member_name}`,
  }));
  const currentValue = currentPick
    ? (useDrawingOrder ? `${currentPick.pick_order}::${currentPick.subgroup_member_name}` : currentPick.subgroup_member_name)
    : "unassigned";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
            vs {game.opponent}
          </div>
          <div className="text-[12px] text-white/45">Game #{game.game_number} · {gameDate} · {game.start_time} CT</div>
        </div>
        {currentPick && (
          <div className="rounded-full bg-[rgba(191,160,72,0.15)] px-3 py-1 text-[11px] text-[var(--gold)]">
            Pick #{currentPick.pick_order}
          </div>
        )}
      </div>

      <Select value={currentValue} onValueChange={(value) => onAssign(game, value)} disabled={disabled}>
        <SelectTrigger className="min-h-[48px] border-white/[0.08] bg-white/[0.03] text-white disabled:opacity-50">
          <SelectValue placeholder="Assign this game" />
        </SelectTrigger>
        <SelectContent className="border-white/[0.08] text-white" side="bottom" sideOffset={8} position="popper">
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {selectOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}