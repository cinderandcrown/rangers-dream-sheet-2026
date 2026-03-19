import React, { useState, useEffect } from "react";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  size: 1.5 + Math.random() * 2,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 10,
  color: i % 3 === 0 ? "rgba(192,17,31,0.25)" : i % 3 === 1 ? "rgba(191,160,72,0.3)" : "rgba(255,255,255,0.15)",
}));

function ProgressRing({ submitted, total }) {
  const allIn = submitted === total;
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

function StatCell({ children, delay }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-0.5 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 hover:bg-white/[0.03] group cursor-default"
      style={{ opacity: 0, animation: `heroSlideUp 0.5s ease-out ${delay}s forwards` }}
    >
      {children}
    </div>
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
    <div className="relative overflow-hidden">
      {/* ── Background layers ── */}

      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-orb absolute left-1/2 -translate-x-1/2 -top-[100px] h-[400px] w-[400px] rounded-full" style={{ background: "rgba(0,50,120,0.15)", filter: "blur(80px)", animationDuration: "7s" }} />
        <div className="hero-orb absolute -right-[80px] top-[20px] h-[300px] w-[300px] rounded-full" style={{ background: "rgba(192,17,31,0.12)", filter: "blur(80px)", animationDuration: "6s", animationDelay: "1s" }} />
        <div className="hero-orb absolute -left-[60px] bottom-[0px] h-[250px] w-[250px] rounded-full" style={{ background: "rgba(191,160,72,0.08)", filter: "blur(80px)", animationDuration: "8s", animationDelay: "2s" }} />
      </div>

      {/* Baseball diamond field lines — hidden on mobile */}
      <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-center hero-field-lines" aria-hidden="true">
        <div className="relative" style={{ width: "220px", height: "220px" }}>
          {[180, 130, 80].map((size, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: `${size}px`, height: `${size}px`,
                transform: "translate(-50%, -50%) rotate(45deg)",
                border: "1px solid rgba(191,160,72,0.06)",
                borderRadius: "4px",
              }}
            />
          ))}
          {/* Base dots */}
          {[
            { top: "-3px", left: "50%", transform: "translateX(-50%)" },
            { bottom: "-3px", left: "50%", transform: "translateX(-50%)" },
            { left: "-3px", top: "50%", transform: "translateY(-50%)" },
            { right: "-3px", top: "50%", transform: "translateY(-50%)" },
          ].map((pos, i) => (
            <div key={`base-${i}`} className="absolute h-[5px] w-[5px] rounded-full bg-[rgba(191,160,72,0.12)]" style={pos} />
          ))}
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
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[6px] w-[6px] rounded-full bg-[rgba(192,17,31,0.15)]" style={{ boxShadow: "0 0 12px rgba(192,17,31,0.15)" }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-[780px] px-6 pb-2 pt-10 sm:pt-14 text-center">
        {/* Season pill */}
        <div
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2"
          style={{ opacity: 0, animation: "heroSlideUp 0.5s ease-out 0.2s forwards", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <span className="text-base">⚾</span>
          <span
            className="text-[11px] font-semibold tracking-[3px] text-white/60"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
          >
            2026 Season · Globe Life Field
          </span>
        </div>

        {/* Headline */}
        <h2
          className="hero-shimmer-text mb-3 text-[clamp(32px,6.5vw,56px)] font-bold leading-[0.92]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", opacity: 0, animation: "heroSlideUp 0.5s ease-out 0.4s forwards" }}
        >
          It's{" "}
          <span className="relative inline-block" style={{ color: "var(--red)" }}>
            Baseball Time
            <span
              className="hero-underline-grow absolute -bottom-0.5 left-0 h-[3px] rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, var(--red), transparent)" }}
            />
          </span>
          <br />
          in <span style={{ color: "var(--gold)" }}>Texas</span>
        </h2>

        {/* Subtitle */}
        <p
          className="mx-auto mb-8 max-w-[480px] text-[13px] sm:text-[15px] leading-[1.6] text-white/40"
          style={{ opacity: 0, animation: "heroSlideUp 0.5s ease-out 0.65s forwards" }}
        >
          Tap your name, rank the games you want most, and submit your Dream Sheet.
        </p>

        {/* Stats row */}
        <div
          className="mx-auto mb-4 flex max-w-[480px] items-center justify-center gap-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          style={{ opacity: 0, animation: "heroStatsIn 0.6s ease-out 0.85s forwards", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          {/* Games */}
          <StatCell delay={0.95}>
            <span
              className="text-[17px] sm:text-[20px] font-bold leading-none text-white transition-transform duration-200 group-hover:scale-110"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {animatedGames}
            </span>
            <span className="text-[8px] sm:text-[9px] font-medium tracking-[1.5px] text-white/30" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
              Games
            </span>
          </StatCell>

          <div className="h-8 w-px bg-white/[0.06]" />

          {/* Submitted */}
          <StatCell delay={1.0}>
            <div className="flex items-center gap-1.5">
              <ProgressRing submitted={animatedSubmitted} total={totalMembers} />
              <span
                className={`text-[17px] sm:text-[20px] font-bold leading-none transition-transform duration-200 group-hover:scale-110 ${allIn ? "text-green-400" : "text-white"}`}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {animatedSubmitted}/{totalMembers}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-medium tracking-[1.5px] text-white/30" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
              {allIn ? "All In!" : "Submitted"}
            </span>
          </StatCell>

          <div className="h-8 w-px bg-white/[0.06]" />

          {/* Deadline */}
          <StatCell delay={1.05}>
            <span
              className="text-[17px] sm:text-[20px] font-bold leading-none text-[var(--gold)] transition-transform duration-200 group-hover:scale-110"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Mar 18
            </span>
            <span className="text-[8px] sm:text-[9px] font-medium tracking-[1.5px] text-white/30" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
              Deadline
            </span>
          </StatCell>
        </div>

        {/* Opening Day countdown */}
        {daysUntil !== null && (
          <div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              opacity: 0,
              animation: "heroSlideUp 0.5s ease-out 1.1s forwards",
              background: daysUntil > 0 ? "rgba(192,17,31,0.08)" : "rgba(34,197,94,0.08)",
              border: `1px solid ${daysUntil > 0 ? "rgba(192,17,31,0.12)" : "rgba(34,197,94,0.15)"}`,
            }}
          >
            {daysUntil > 0 ? (
              <span className="text-[12px] text-white/50" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                🏟️ <strong className="text-[var(--red)] font-bold">{daysUntil}</strong> days until Opening Day · Apr 3 vs Reds
              </span>
            ) : (
              <span className="text-[12px] text-green-400 font-semibold" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                ⚾ THE 2026 SEASON IS LIVE!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}