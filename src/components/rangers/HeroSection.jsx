import React from "react";

export default function HeroSection({ totalGames, submittedCount, totalMembers }) {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, var(--red), transparent 70%)" }} />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-[200px] w-[200px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, var(--gold), transparent 70%)" }} />

      <div className="relative mx-auto max-w-[780px] px-6 pb-2 pt-10 sm:pt-14 text-center">
        {/* Season pill */}
        <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 backdrop-blur-sm">
          <span className="text-base">⚾</span>
          <span
            className="text-[11px] font-semibold tracking-[3px] text-white/60"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
          >
            2026 Season
          </span>
        </div>

        {/* Headline — more compact */}
        <h2
          className="mb-3 text-[clamp(32px,6.5vw,56px)] font-bold leading-[0.92]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          It's{" "}
          <span className="relative inline-block" style={{ color: "var(--red)" }}>
            Baseball Time
            <span className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full opacity-30" style={{ background: "var(--red)" }} />
          </span>
          <br />
          in <span style={{ color: "var(--gold)" }}>Texas</span>
        </h2>

        {/* Shorter description */}
        <p className="mx-auto mb-8 max-w-[480px] text-[13px] sm:text-[15px] leading-[1.6] text-white/40">
          Pick your name below, rank the {totalGames} home games you want most, and submit.
          Clark will run the allocation after the deadline.
        </p>

        {/* Stats row — tighter */}
        <div className="mx-auto mb-8 flex max-w-[440px] items-center justify-center gap-0 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <StatCell label="Games" value={totalGames} />
          <div className="h-8 w-px bg-white/[0.06]" />
          <StatCell label="Submitted" value={`${submittedCount}/${totalMembers}`} highlight={submittedCount === totalMembers} />
          <div className="h-8 w-px bg-white/[0.06]" />
          <StatCell label="Deadline" value="Mar 18" isDeadline />
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, highlight, isDeadline }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 px-2 sm:px-4 py-2.5 sm:py-3">
      <span
        className={`text-[17px] sm:text-[20px] font-bold leading-none ${highlight ? "text-green-400" : isDeadline ? "text-[var(--gold)]" : "text-white"}`}
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {value}
      </span>
      <span
        className="text-[8px] sm:text-[9px] font-medium tracking-[1.5px] text-white/30"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
      >
        {label}
      </span>
    </div>
  );
}