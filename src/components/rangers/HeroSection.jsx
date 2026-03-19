import React, { useState, useEffect } from "react";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${8 + Math.random() * 84}%`,
  size: 1.5 + Math.random() * 2,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 8,
  color: i % 3 === 0 ? "rgba(192,17,31,0.25)" : i % 3 === 1 ? "rgba(191,160,72,0.3)" : "rgba(255,255,255,0.15)",
}));

function ProgressRing({ submitted, total, allIn }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = (submitted / total) * circumference;

  return (
    <svg width="36" height="36" className="hero-progress-ring flex-shrink-0">
      <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
      <circle
        cx="18" cy="18" r={radius} fill="none"
        stroke={allIn ? "#22C55E" : "#BFA048"}
        strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
      />
    </svg>
  );
}

export default function HeroSection({ totalGames, submittedCount, totalMembers }) {
  const [animatedGames, setAnimatedGames] = useState(0);
  const [animatedSubmitted, setAnimatedSubmitted] = useState(0);
  const [daysUntil, setDaysUntil] = useState(null);

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setAnimatedGames(Math.round(totalGames * ease));
      setAnimatedSubmitted(Math.round(submittedCount * ease));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [totalGames, submittedCount]);

  useEffect(() => {
    const opening = new Date("2026-04-03T15:05:00-05:00");
    const now = new Date();
    setDaysUntil(Math.max(0, Math.ceil((opening - now) / (1000 * 60 * 60 * 24))));
  }, []);

  const allIn = submittedCount === totalMembers;

  return (
    <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0D1B30 50%, #0A1628 100%)" }}>
      {/* ── Background layers ── */}

      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-orb absolute left-1/2 -translate-x-1/2 -top-[150px] h-[400px] w-[400px] rounded-full" style={{ background: "rgba(0,50,120,0.15)", filter: "blur(80px)", animationDuration: "7s", animationDelay: "1s" }} />
        <div className="absolute -right-[80px] -top-[100px] h-[300px] w-[300px] rounded-full" style={{ background: "rgba(192,17,31,0.12)", filter: "blur(80px)", animation: "heroOrbPulse 6s ease-in-out infinite" }} />
        <div className="absolute -left-[60px] -bottom-[50px] h-[250px] w-[250px] rounded-full" style={{ background: "rgba(191,160,72,0.08)", filter: "blur(80px)", animation: "heroOrbPulse 8s ease-in-out 2s infinite" }} />
      </div>

      {/* Baseball diamond field lines — hidden on mobile */}
      <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-center hero-field-lines" aria-hidden="true">
        <div className="relative" style={{ width: "400px", height: "400px", transform: "rotate(45deg)" }}>
          {[0, 40, 80].map((inset, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                inset: `${inset}px`,
                border: `1px solid rgba(191,160,72,${0.06 - i * 0.01})`,
                borderRadius: "4px",
              }}
            />
          ))}
          {/* Base dots */}
          <div className="absolute h-2 w-2 rounded-sm bg-[rgba(191,160,72,0.12)]" style={{ bottom: "-4px", left: "50%", marginLeft: "-4px", transform: "rotate(-45deg)" }} />
          <div className="absolute h-2 w-2 rounded-sm bg-[rgba(191,160,72,0.12)]" style={{ right: "-4px", top: "50%", marginTop: "-4px", transform: "rotate(-45deg)" }} />
          <div className="absolute h-2 w-2 rounded-sm bg-[rgba(191,160,72,0.12)]" style={{ top: "-4px", left: "50%", marginLeft: "-4px", transform: "rotate(-45deg)" }} />
          <div className="absolute h-2 w-2 rounded-sm bg-[rgba(191,160,72,0.12)]" style={{ left: "-4px", top: "50%", marginTop: "-4px", transform: "rotate(-45deg)" }} />
        </div>
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="hero-particle absolute rounded-full"
            style={{
              left: p.left,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Arc line */}
      <div className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 hero-arc" aria-hidden="true">
        <div
          style={{
            width: "600px",
            height: "300px",
            borderTop: "1px solid rgba(192,17,31,0.08)",
            borderLeft: "1px solid rgba(192,17,31,0.04)",
            borderRight: "1px solid rgba(192,17,31,0.04)",
            borderRadius: "300px 300px 0 0",
            position: "relative",
          }}
        >
          {/* Top glow highlight */}
          <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 h-[3px] w-[80px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(192,17,31,0.3), transparent)" }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-[1] mx-auto max-w-[780px] px-6 pb-4 pt-12 sm:pt-14 text-center">
        {/* Season pill */}
        <div
          className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2"
          style={{ opacity: 0, animation: "heroSlideUp 0.6s ease-out 0.2s forwards", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <span className="text-base">⚾</span>
          <span
            className="oswald text-[11px] font-semibold tracking-[3px] text-white/60"
          >
            2026 Season · Globe Life Field
          </span>
        </div>

        {/* Headline */}
        <h2
          className="hero-shimmer-text mb-4 text-[clamp(36px,7vw,62px)] font-bold leading-[0.9]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px", opacity: 0, animation: "heroSlideUp 0.7s ease-out 0.4s forwards" }}
        >
          It's{" "}
          <span className="relative inline-block" style={{ color: "var(--red)" }}>
            Baseball Time
            <span
              className="hero-underline-grow absolute -bottom-[3px] left-0 h-[3px] rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, var(--red), transparent)" }}
            />
          </span>
          <br />
          in <span style={{ color: "var(--gold)" }}>Texas</span>
        </h2>

        {/* Subtitle */}
        <p
          className="mx-auto mb-8 max-w-[460px] text-[14px] sm:text-[15px] leading-[1.6] text-white/40"
          style={{ opacity: 0, animation: "heroSlideUp 0.6s ease-out 0.65s forwards" }}
        >
          Tap your name, rank the games you want most, and submit your Dream Sheet.
        </p>

        {/* Stats row */}
        <div
          className="mx-auto mb-5 flex max-w-[520px] items-stretch justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          style={{ opacity: 0, animation: "heroStatsIn 0.7s ease-out 0.85s forwards", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          {/* Games */}
          <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-3 sm:px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03] group cursor-default">
            <span
              className="oswald text-[20px] sm:text-[22px] font-bold leading-none text-white transition-transform duration-200 group-hover:scale-110"
            >
              {animatedGames}
            </span>
            <span className="oswald text-[8px] sm:text-[9px] font-medium tracking-[1.5px] text-white/30">
              HOME GAMES
            </span>
          </div>

          <div className="w-px bg-white/[0.06] my-2.5" />

          {/* Submitted */}
          <div className="flex flex-1 items-center justify-center gap-2.5 px-3 sm:px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03] group cursor-default">
            <ProgressRing submitted={animatedSubmitted} total={totalMembers} allIn={allIn} />
            <div className="flex flex-col items-start gap-0.5">
              <span
                className={`oswald text-[20px] sm:text-[22px] font-bold leading-none transition-transform duration-200 group-hover:scale-110 ${allIn ? "text-green-400" : "text-white"}`}
              >
                {animatedSubmitted}/{totalMembers}
              </span>
              <span className={`oswald text-[8px] sm:text-[9px] font-medium tracking-[1.5px] ${allIn ? "text-green-400/60" : "text-white/30"}`}>
                {allIn ? "ALL IN!" : "SUBMITTED"}
              </span>
            </div>
          </div>

          <div className="w-px bg-white/[0.06] my-2.5" />

          {/* Deadline */}
          <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-3 sm:px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03] group cursor-default">
            <span
              className="oswald text-[20px] sm:text-[22px] font-bold leading-none transition-transform duration-200 group-hover:scale-110"
              style={{ color: "var(--gold)" }}
            >
              Mar 18
            </span>
            <span className="oswald text-[8px] sm:text-[9px] font-medium tracking-[1.5px] text-white/30">
              DEADLINE
            </span>
          </div>
        </div>

        {/* Opening Day countdown */}
        {daysUntil !== null && (
          <div
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-[10px] px-4 py-1.5"
            style={{
              opacity: 0,
              animation: "heroSlideUp 0.5s ease-out 1.1s forwards",
              background: daysUntil > 0 ? "rgba(192,17,31,0.08)" : "rgba(34,197,94,0.08)",
              border: `1px solid ${daysUntil > 0 ? "rgba(192,17,31,0.12)" : "rgba(34,197,94,0.15)"}`,
            }}
          >
            {daysUntil > 0 ? (
              <span className="text-[12px] text-white/50">
                🏟️{" "}
                <strong className="oswald font-bold" style={{ color: "var(--red)" }}>{daysUntil}</strong>
                {" "}
                <span className="oswald text-[12px] font-medium tracking-[1px] uppercase text-white/50">
                  days until Opening Day
                </span>
                <span className="text-white/25 mx-1.5">·</span>
                <span className="oswald text-[12px] font-medium tracking-[1px] uppercase text-white/50">
                  Apr 3 vs Reds
                </span>
              </span>
            ) : (
              <span className="oswald text-[12px] font-semibold tracking-[1px] uppercase text-green-400">
                ⚾ The 2026 Season is Live!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}