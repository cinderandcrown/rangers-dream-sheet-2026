import React from "react";
import { Download } from "lucide-react";
import { downloadSubgroupMemberExcel } from "./subgroupExports";

export default function SubgroupScheduleDistribution({ managerName, games, picks }) {
  const memberNames = Array.from(new Set(picks.map((pick) => pick.subgroup_member_name))).sort((a, b) => a.localeCompare(b));

  if (memberNames.length === 0) return null;

  return (
    <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
        Subgroup Schedules
      </div>
      <div className="space-y-2">
        {memberNames.map((name) => {
          const assignedCount = picks.filter((pick) => pick.subgroup_member_name === name).length;
          return (
            <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/10 px-4 py-3">
              <div>
                <div className="text-[14px] font-semibold text-white">{name}</div>
                <div className="text-[12px] text-white/40">{assignedCount} game{assignedCount !== 1 ? "s" : ""}</div>
              </div>
              <button
                onClick={() => downloadSubgroupMemberExcel(managerName, name, games, picks)}
                aria-label={`Download schedule for ${name}`}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-[12px] font-semibold text-white/80 transition hover:bg-white/[0.08]"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                <Download className="h-4 w-4" />
                Generate Schedule
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}