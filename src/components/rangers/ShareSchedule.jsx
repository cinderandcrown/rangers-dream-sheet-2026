import React from "react";
import { format, parseISO } from "date-fns";
import { Copy, Share2 } from "lucide-react";

export default function ShareSchedule({ memberName, memberGames, onToast }) {
  const buildSummaryText = () => {
    const monthGroups = {};
    memberGames.forEach((g) => {
      if (!monthGroups[g.month]) monthGroups[g.month] = [];
      monthGroups[g.month].push(g);
    });

    const monthOrder = ["April", "May", "June", "July", "August", "September"];
    let lines = [`My 2026 Rangers Games (${memberGames.length} games)\n`];

    monthOrder.forEach((month) => {
      const games = monthGroups[month];
      if (!games) return;
      const gameStrs = games.map((g) => `vs ${g.opponent} (${format(parseISO(g.date), "MMM d")})`);
      lines.push(`${month}: ${gameStrs.join(", ")}`);
    });

    lines.push(`\nView full schedule: texasrangers2026.base44.app`);
    return lines.join("\n");
  };

  const handleCopy = async () => {
    const text = buildSummaryText();
    await navigator.clipboard.writeText(text);
    onToast("Schedule copied to clipboard!");
  };

  const handleShare = async () => {
    const text = `Check out my 2026 Rangers season ticket schedule! 🏟️⚾`;
    const url = window.location.origin;

    if (navigator.share) {
      navigator.share({ title: `${memberName}'s Rangers 2026`, text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      onToast("Share link copied!");
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-white/[0.04] bg-white/[0.02] px-5 py-4">
      <h4
        className="text-[12px] font-semibold tracking-[1.5px] text-white/30 mb-3"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
      >
        Share Your Schedule
      </h4>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          aria-label="Copy schedule summary to clipboard"
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 min-h-[44px] py-2.5 text-[11px] font-semibold text-white/50 transition hover:bg-white/[0.06] hover:text-white/70"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          <Copy className="h-3.5 w-3.5" /> Copy Summary
        </button>
        <button
          onClick={handleShare}
          aria-label="Share schedule link"
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(191,160,72,0.15)] bg-[rgba(191,160,72,0.05)] px-4 min-h-[44px] py-2.5 text-[11px] font-semibold text-[var(--gold)] transition hover:bg-[rgba(191,160,72,0.1)]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          <Share2 className="h-3.5 w-3.5" /> Share Link
        </button>
      </div>
    </div>
  );
}