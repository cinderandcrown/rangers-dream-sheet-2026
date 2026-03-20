import React from "react";
import { downloadMemberScheduleCsv } from "./adminHelpers";
import { downloadMasterExcel, downloadMemberExcel, getMemberScheduleData, generateAllSchedulesHtml } from "./scheduleExports";
import CopyEmailSummary from "./CopyEmailSummary";
import { useTabNavigation } from "@/lib/TabNavigationContext";

export default function ScheduleDistribution({ members, games, allocations, onToast }) {
  const { push } = useTabNavigation();

  const handleViewSchedule = (name) => {
    push(`/Schedule?memberName=${encodeURIComponent(name)}`);
  };

  const handleMemberExcel = (member) => {
    downloadMemberExcel(member.name, member.accent_color, games, allocations);
  };

  const handleMasterExcel = () => {
    downloadMasterExcel(games, allocations, members);
  };

  const handleAllSchedulesHtml = () => {
    const html = generateAllSchedulesHtml(members, games, allocations);
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <div className="mb-5 rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-6">
      <h4
        className="mb-4 text-lg font-semibold text-[var(--gold)]"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
      >
        📋 Schedule Distribution
      </h4>
      <p className="mb-5 text-sm text-white/50">
        View, print, and export individual schedules for each member. Download Excel workbooks or Outlook-compatible CSVs.
      </p>

      <div className="mb-5 space-y-2">
        {members.map((member) => {
          const memberGames = getMemberScheduleData(member.name, games, allocations);
          return (
            <div
              key={member.name}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: member.accent_color }}
                />
                <span className="text-[14px] font-semibold" style={{ color: member.accent_color }}>
                  {member.name}
                </span>
              </div>
              <span className="text-[13px] text-white/40">
                {memberGames.length} games
              </span>
              <div className="ml-auto flex flex-wrap gap-2">
                <ActionBtn onClick={() => handleViewSchedule(member.name)} label="👁 View" />
                <ActionBtn onClick={() => downloadMemberScheduleCsv(member.name, games, allocations)} label="📥 CSV" />
                <ActionBtn onClick={() => handleMemberExcel(member)} label="📥 Excel" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-[10px] border-t border-white/[0.06] pt-4">
        <button
          onClick={handleMasterExcel}
          className="rounded-[10px] border border-white/12 bg-transparent px-4 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          📥 Master Excel
        </button>
        <button
          onClick={handleAllSchedulesHtml}
          className="rounded-[10px] border border-white/12 bg-transparent px-4 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          📥 All Schedules (Printable)
        </button>
        <CopyEmailSummary members={members} games={games} allocations={allocations} onToast={onToast} />
      </div>
    </div>
  );
}

function ActionBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
    >
      {label}
    </button>
  );
}