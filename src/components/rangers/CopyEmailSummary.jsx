import React from "react";
import { Copy } from "lucide-react";
import { getMemberScheduleData } from "./scheduleExports";

export default function CopyEmailSummary({ members, games, allocations, onToast }) {
  const handleCopy = async () => {
    const lines = ["Rangers 2026 Season Ticket Allocation — Final Results\n"];

    members.forEach((m) => {
      const memberGames = getMemberScheduleData(m.name, games, allocations);
      const weekendCount = memberGames.filter((g) => ["Fri", "Sat", "Sun"].includes(g.day_of_week)).length;
      const weekdayCount = memberGames.length - weekendCount;
      lines.push(`${m.name}: ${memberGames.length} games (${weekendCount} weekend, ${weekdayCount} weekday)`);
    });

    const openingDay = games.find((g) => g.game_number === 1);
    if (openingDay) {
      lines.push(`\nOpening Day (Apr 3 vs ${openingDay.opponent}): Reserved`);
    }

    lines.push(`\nFull schedules and calendar files available at:`);
    lines.push(`texasrangers2026.base44.app → My Games`);
    lines.push(`\n— Clark, Will Family IT Guy`);

    await navigator.clipboard.writeText(lines.join("\n"));
    onToast("Email summary copied to clipboard!");
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-[10px] border border-white/12 bg-transparent px-4 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
      style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
    >
      <span className="flex items-center gap-2">
        <Copy className="h-4 w-4" /> Copy Email Summary
      </span>
    </button>
  );
}