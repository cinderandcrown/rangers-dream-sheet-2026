import React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SubgroupMemberManager({ managerName, members, picks, onRefresh, onToast }) {
  const [newMemberName, setNewMemberName] = React.useState("");

  const assignmentCounts = picks.reduce((acc, pick) => {
    acc[pick.subgroup_member_name] = (acc[pick.subgroup_member_name] || 0) + 1;
    return acc;
  }, {});

  const handleAdd = async () => {
    const name = newMemberName.trim();
    if (!name) return;

    await base44.entities.SubgroupMember.create({
      manager_name: managerName,
      member_name: name,
      pick_order: members.length + 1,
      is_active: true,
    });

    setNewMemberName("");
    onRefresh();
    onToast(`${name} added to ${managerName}'s subgroup`);
  };

  const handleMove = async (member, direction) => {
    const currentIndex = members.findIndex((item) => item.id === member.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapMember = members[swapIndex];
    if (!swapMember) return;

    await Promise.all([
      base44.entities.SubgroupMember.update(member.id, { pick_order: swapMember.pick_order }),
      base44.entities.SubgroupMember.update(swapMember.id, { pick_order: member.pick_order }),
    ]);

    onRefresh();
  };

  const handleRemove = async (member) => {
    const relatedPicks = picks.filter((pick) => pick.subgroup_member_name === member.member_name);
    await Promise.all([
      ...relatedPicks.map((pick) => base44.entities.SubgroupPick.delete(pick.id)),
      base44.entities.SubgroupMember.delete(member.id),
    ]);

    onRefresh();
    onToast(`${member.member_name} removed from the subgroup`);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="Add subgroup member"
          aria-label="Add subgroup member"
          className="min-h-[44px] flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-[14px] text-white placeholder-white/30 outline-none"
        />
        <button
          onClick={handleAdd}
          aria-label="Add subgroup member"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-[12px] font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="space-y-2">
        {members.map((member, index) => (
          <div key={member.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-[13px] font-bold text-white">
              {member.pick_order}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold text-white">{member.member_name}</div>
              <div className="text-[12px] text-white/40">{assignmentCounts[member.member_name] || 0} drafted games</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleMove(member, "up")} disabled={index === 0} aria-label={`Move ${member.member_name} up`} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-white/50 disabled:opacity-30">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button onClick={() => handleMove(member, "down")} disabled={index === members.length - 1} aria-label={`Move ${member.member_name} down`} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-white/50 disabled:opacity-30">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button onClick={() => handleRemove(member)} aria-label={`Remove ${member.member_name}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(192,17,31,0.15)] text-[var(--red)]">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}