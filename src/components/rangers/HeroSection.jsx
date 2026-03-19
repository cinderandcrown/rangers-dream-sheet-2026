import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { GAME_SEED_DATA, TEAM_COLORS, TEAM_ABBREVIATIONS } from "./constants";

function StatCell({ label, value, isGold }) {
  return (
    <div className="hero-stat-cell" style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      gap: 2, padding: "14px 12px",
    }}>
      <span className="hero-stat-value" style={{
        fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700,
        lineHeight: 1, color: isGold ? "#BFA048" : "white",
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: "'Oswald', sans-serif", fontSize: 9, fontWeight: 500,
        letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
      }}>
        {label}
      </span>
    </div>
  );
}

function SubmissionCell({ submitted, total, allIn }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = (submitted / total) * circumference;

  return (
    <div className="hero-stat-cell" style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10, padding: "14px 12px",
    }}>
      <svg width="36" height="36" className="hero-progress-ring-v2" style={{ flexShrink: 0 }}>
        <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
        <circle cx="18" cy="18" r={radius} fill="none"
          stroke={allIn ? "#22C55E" : "#BFA048"}
          strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
        <span className="hero-stat-value" style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700,
          lineHeight: 1, color: allIn ? "#22C55E" : "white",
        }}>
          {submitted}/{total}
        </span>
        <span style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 9, fontWeight: 500,
          letterSpacing: 1.5, textTransform: "uppercase",
          color: allIn ? "rgba(34,197,94,0.6)" : "rgba(255,255,255,0.3)",
        }}>
          {allIn ? "All In!" : "Submitted"}
        </span>
      </div>
    </div>
  );
}

function getNextGame(allocations) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const upcoming = GAME_SEED_DATA
    .filter(g => g.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!upcoming.length) return null;
  const game = upcoming[0];
  const alloc = allocations?.find(a => a.game_number === game.game_number);
  return { ...game, owner: alloc?.assigned_to || null };
}

export default function HeroSection({ totalGames, submittedCount, totalMembers, allocations }) {
  const [daysUntil, setDaysUntil] = useState(0);
  const [count, setCount] = useState({ games: 0, submitted: 0 });

  useEffect(() => {
    const opening = new Date("2026-04-03T15:05:00-05:00");
    const now = new Date();
    const diff = Math.max(0, Math.ceil((opening - now) / (1000 * 60 * 60 * 24)));
    setDaysUntil(diff);

    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        games: Math.round(totalGames * ease),
        submitted: Math.round(submittedCount * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [totalGames, submittedCount]);

  const allIn = submittedCount === totalMembers;
  const nextGame = getNextGame(allocations);
  const seasonLive = daysUntil <= 0;

  return (
    <div className="hero-wrap-v2">
      <style>{`
        .hero-wrap-v2 {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #0A1628 0%, #0D1B30 50%, #0A1628 100%);
          padding: 0 0 16px;
        }

        .hero-wrap-v2 .hero-field-lines-v2 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -45%) rotate(45deg);
          width: 400px;
          height: 400px;
          opacity: 0;
          animation: heroFieldFadeInV2 2s ease-out 0.3s forwards;
        }

        .hero-wrap-v2 .diamond-v2 {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(191,160,72,0.06);
          border-radius: 4px;
        }
        .hero-wrap-v2 .diamond-v2:nth-child(2) {
          inset: 40px;
          border-color: rgba(191,160,72,0.04);
        }
        .hero-wrap-v2 .diamond-v2:nth-child(3) {
          inset: 80px;
          border-color: rgba(191,160,72,0.03);
        }

        .hero-wrap-v2 .base-v2 {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(191,160,72,0.12);
          transform: rotate(-45deg);
        }
        .hero-wrap-v2 .base-v2.home { bottom: -4px; left: 50%; margin-left: -4px; }
        .hero-wrap-v2 .base-v2.first { right: -4px; top: 50%; margin-top: -4px; }
        .hero-wrap-v2 .base-v2.second { top: -4px; left: 50%; margin-left: -4px; }
        .hero-wrap-v2 .base-v2.third { left: -4px; top: 50%; margin-top: -4px; }

        .hero-wrap-v2 .hero-arc-v2 {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          border: 1px solid rgba(192,17,31,0.08);
          border-radius: 50%;
          border-bottom: none;
          opacity: 0;
          animation: heroArcFadeInV2 1.5s ease-out 0.5s forwards;
        }
        .hero-wrap-v2 .hero-arc-v2::after {
          content: '';
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(192,17,31,0.3), transparent);
          border-radius: 2px;
        }

        .hero-wrap-v2 .orb-v2 {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .hero-wrap-v2 .orb-red-v2 {
          width: 300px; height: 300px;
          background: rgba(192,17,31,0.12);
          top: -100px; right: -80px;
          animation: heroOrbPulseSimpleV2 6s ease-in-out infinite;
        }
        .hero-wrap-v2 .orb-gold-v2 {
          width: 250px; height: 250px;
          background: rgba(191,160,72,0.08);
          bottom: -50px; left: -60px;
          animation: heroOrbPulseSimpleV2 8s ease-in-out 2s infinite;
        }
        .hero-wrap-v2 .orb-navy-v2 {
          width: 400px; height: 400px;
          background: rgba(0,50,120,0.15);
          top: -150px; left: 50%;
          transform: translateX(-50%);
          animation: heroOrbPulseV2 7s ease-in-out 1s infinite;
        }

        .hero-wrap-v2 .particles-v2 {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .hero-wrap-v2 .particle-v2 {
          position: absolute;
          border-radius: 50%;
          animation: heroFloatV2 linear infinite;
        }

        .hero-wrap-v2 .hero-pill-v2 {
          opacity: 0;
          transform: translateY(12px);
          animation: heroSlideUpV2 0.6s ease-out 0.2s forwards;
        }
        .hero-wrap-v2 .hero-event-card-v2 {
          opacity: 0;
          transform: translateY(12px);
          animation: heroSlideUpV2 0.6s ease-out 0.35s forwards;
        }
        .hero-wrap-v2 .hero-headline-v2 {
          opacity: 0;
          transform: translateY(16px);
          animation: heroSlideUpV2 0.7s ease-out 0.55s forwards;
        }
        .hero-wrap-v2 .hero-sub-v2 {
          opacity: 0;
          transform: translateY(12px);
          animation: heroSlideUpV2 0.6s ease-out 0.7s forwards;
        }
        .hero-wrap-v2 .hero-stats-v2 {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
          animation: heroStatsInV2 0.7s ease-out 0.85s forwards;
        }

        .hero-wrap-v2 .shimmer-text-v2 {
          background: linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(191,160,72,0.15) 50%, rgba(255,255,255,0) 60%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: heroShimmerV2 4s ease-in-out 2s infinite;
        }

        .hero-stat-cell {
          position: relative;
          transition: all 0.2s;
        }
        .hero-stat-cell:hover {
          background: rgba(255,255,255,0.03);
        }
        .hero-stat-cell .hero-stat-value {
          transition: transform 0.2s;
        }
        .hero-stat-cell:hover .hero-stat-value {
          transform: scale(1.08);
        }

        .hero-progress-ring-v2 {
          transform: rotate(-90deg);
        }
        .hero-progress-ring-v2 circle {
          transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-wrap-v2 .red-underline-v2 {
          position: absolute;
          bottom: -3px;
          left: 0;
          height: 3px;
          width: 0;
          background: linear-gradient(90deg, transparent, #C0111F, transparent);
          border-radius: 2px;
          animation: heroUnderlineGrowV2 0.8s ease-out 1.0s forwards;
        }

        @keyframes heroSlideUpV2 {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroStatsInV2 {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes heroFieldFadeInV2 {
          to { opacity: 1; }
        }
        @keyframes heroArcFadeInV2 {
          to { opacity: 1; }
        }
        @keyframes heroOrbPulseV2 {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.15); }
        }
        @keyframes heroOrbPulseSimpleV2 {
          0%, 100% { opacity: 1; scale: 1; }
          50% { opacity: 0.5; scale: 1.2; }
        }
        @keyframes heroShimmerV2 {
          0%, 100% { background-position: 200% center; }
          50% { background-position: -200% center; }
        }
        @keyframes heroFloatV2 {
          from { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          to { transform: translateY(-20px) translateX(30px); opacity: 0; }
        }
        @keyframes heroUnderlineGrowV2 {
          to { width: 100%; }
        }

        @media (max-width: 640px) {
          .hero-wrap-v2 .hero-field-lines-v2 { display: none; }
          .hero-wrap-v2 .hero-arc-v2 { display: none; }
        }
      `}</style>

      {/* Background layers */}
      <div className="orb-v2 orb-navy-v2" />
      <div className="orb-v2 orb-red-v2" />
      <div className="orb-v2 orb-gold-v2" />

      <div className="hero-field-lines-v2">
        <div className="diamond-v2" />
        <div className="diamond-v2" />
        <div className="diamond-v2" />
        <div className="base-v2 home" />
        <div className="base-v2 first" />
        <div className="base-v2 second" />
        <div className="base-v2 third" />
      </div>

      <div className="hero-arc-v2" />

      <div className="particles-v2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle-v2"
            style={{
              left: `${8 + Math.random() * 84}%`,
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 8}s`,
              width: `${1.5 + Math.random() * 2}px`,
              height: `${1.5 + Math.random() * 2}px`,
              background: i % 3 === 0 ? "rgba(192,17,31,0.25)" : i % 3 === 1 ? "rgba(191,160,72,0.3)" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto", padding: "44px 24px 16px", textAlign: "center" }}>

        {/* Season pill */}
        <div className="hero-pill-v2" style={{ marginBottom: 16 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            borderRadius: 40, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)", padding: "8px 20px",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: 16 }}>⚾</span>
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
            }}>
              2026 Season · Globe Life Field
            </span>
          </div>
        </div>

        {/* Countdown / Next Game — prominent card below pill */}
        {daysUntil > 0 ? (
          <CountdownCard daysUntil={daysUntil} />
        ) : nextGame ? (
          <NextGameCard game={nextGame} />
        ) : (
          <SeasonLiveCard />
        )}

        {/* Headline */}
        <h2 className="hero-headline-v2 shimmer-text-v2" style={{
          fontFamily: "'Oswald', sans-serif", fontWeight: 700,
          fontSize: "clamp(36px, 7vw, 62px)", textTransform: "uppercase",
          letterSpacing: 2, lineHeight: 0.9, marginBottom: 16,
        }}>
          It's{" "}
          <span style={{ position: "relative", display: "inline-block", color: "#C0111F" }}>
            Baseball Time
            <span className="red-underline-v2" />
          </span>
          <br />
          in <span style={{ color: "#BFA048" }}>Texas</span>
        </h2>

        {/* Subtitle */}
        <p className="hero-sub-v2" style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
          color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 460,
          margin: "0 auto 28px",
        }}>
          Tap your name, rank the games you want most, and submit your Dream Sheet.
        </p>

        {/* Stats row */}
        <div className="hero-stats-v2" style={{
          display: "flex", maxWidth: 520, margin: "0 auto 0",
          borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)", overflow: "hidden",
          backdropFilter: "blur(8px)",
        }}>
          <StatCell label="Home Games" value={count.games} />
          <div style={{ width: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
          <SubmissionCell submitted={count.submitted} total={totalMembers} allIn={allIn} />
          <div style={{ width: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
          <StatCell label="Deadline" value="Mar 18" isGold />
        </div>
      </div>
    </div>
  );
}

function CountdownCard({ daysUntil }) {
  return (
    <div className="hero-event-card-v2" style={{ marginBottom: 24 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 14,
        padding: "12px 24px", borderRadius: 14,
        background: "rgba(192,17,31,0.06)", border: "1px solid rgba(192,17,31,0.12)",
        backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: 22 }}>🏟️</span>
        <div style={{ textAlign: "left" }}>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700,
            lineHeight: 1, color: "white", letterSpacing: 1,
          }}>
            <span style={{ color: "#C0111F", fontSize: 26 }}>{daysUntil}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginLeft: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>
              days until Opening Day
            </span>
          </div>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 500,
            letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 3,
          }}>
            Apr 3 · Reds · 3:05 PM CT
          </div>
        </div>
      </div>
    </div>
  );
}

function NextGameCard({ game }) {
  const teamColor = TEAM_COLORS[game.opponent] || "#475569";
  const teamAbbr = TEAM_ABBREVIATIONS[game.opponent] || game.opponent.slice(0, 3).toUpperCase();
  const gameDate = format(parseISO(game.date), "EEE, MMM d");
  const now = new Date();
  const gameDay = new Date(game.date + "T00:00:00");
  const daysAway = Math.max(0, Math.ceil((gameDay - now) / (1000 * 60 * 60 * 24)));
  const isToday = daysAway === 0;
  const isTomorrow = daysAway === 1;
  const dayLabel = isToday ? "TODAY" : isTomorrow ? "TOMORROW" : `In ${daysAway} days`;

  return (
    <div className="hero-event-card-v2" style={{ marginBottom: 24 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 16,
        padding: "14px 24px", borderRadius: 14,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}>
        {/* Team color dot */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: teamColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, color: "white",
          letterSpacing: 1, flexShrink: 0,
        }}>
          {teamAbbr}
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: 1.5, textTransform: "uppercase",
              color: isToday ? "#22C55E" : "#BFA048",
            }}>
              Next Game · {dayLabel}
            </span>
          </div>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 700,
            lineHeight: 1.1, color: "white", letterSpacing: 0.5, marginTop: 2,
          }}>
            vs {game.opponent}
          </div>
          <div style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.4)", marginTop: 3,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{gameDate} · {game.start_time}</span>
            {game.owner && (
              <>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                <span style={{ color: "#BFA048" }}>🎟 {game.owner}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SeasonLiveCard() {
  return (
    <div className="hero-event-card-v2" style={{ marginBottom: 24 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "12px 24px", borderRadius: 14,
        background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
        backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: 22 }}>⚾</span>
        <span style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700,
          letterSpacing: 1.5, textTransform: "uppercase", color: "#22C55E",
        }}>
          The 2026 Season is Live!
        </span>
      </div>
    </div>
  );
}