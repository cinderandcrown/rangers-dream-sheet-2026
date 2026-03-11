import React from "react";
import { DEADLINE_LABEL } from "./constants";

export default function HeroSection({ totalGames, submittedCount, totalMembers }) {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, var(--red), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-[200px] w-[200px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, var(--gold), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[780px] px-6 pb-4 pt-14 text-center sm:pt-16">
        {/* Season pill */}
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 backdrop-blur-sm">
          <span className="text-base">⚾</span>
          <span
            className="text-[12px] font-semibold tracking-[4px] text-white/70"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
          >
            2026 Season
          </span>
        </div>

        {/* Headline */}
        <h2
          className="mb-4 text-[clamp(36px,7vw,62px)] font-bold leading-[0.95]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          It's{" "}
          <span
            className="relative inline-block"
            style={{ color: "var(--red)" }}
          >
            Baseball Time
            <span
              className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full opacity-40"
              style={{ background: "var(--red)" }}
            />
          </span>
          <br />
          in{" "}
          <span style={{ color: "var(--gold)" }}>Texas</span>
        </h2>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-[540px] text-[14px] sm:text-[16px] leading-[1.7] text-white/50">
          Welcome to the 2026 Texas Rangers Season! This app was built for our Dream Sheet selection.
          Just follow the simple steps below — pick your name, rank the {totalGames} home games you want most, and hit submit.
          Works great on desktop or mobile and should only take a few minutes.
          Reach out to Clark if anything isn't working or you have questions!
        </p>

        {/* Stats row */}
        <div className="mx-auto mb-10 flex max-w-[520px] items-center justify-center gap-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <StatCell label="Games" value={totalGames} />
          <div className="h-10 w-px bg-white/[0.06]" />
          <StatCell label="Submitted" value={`${submittedCount}/${totalMembers}`} highlight={submittedCount === totalMembers} />
          <div className="h-10 w-px bg-white/[0.06]" />
          <StatCell label="Deadline" value="Mar 18" isDeadline />
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, highlight, isDeadline }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-2 sm:px-4 py-3 sm:py-4">
      <span
        className={`text-[18px] sm:text-[22px] font-bold leading-none ${highlight ? "text-green-400" : isDeadline ? "text-[var(--gold)]" : "text-white"}`}
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {value}
      </span>
      <span
        className="text-[9px] sm:text-[10px] font-medium tracking-[1.5px] sm:tracking-[2px] text-white/35"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
      >
        {label}
      </span>
    </div>
  );
}