import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, Home } from "lucide-react";

export default function BrandHeader({ showBack, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isMyGames = location.pathname === "/MyGames";

  return (
    <header
      className="sticky top-0 z-[100]"
      style={{
        background: "linear-gradient(135deg, var(--navy), #001845)",
        borderBottom: "3px solid var(--red)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03) inset",
        paddingTop: "env(safe-area-inset-top, 0px)"
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center gap-3">
          {/* Back button or logo */}
          {showBack ? (
            <button
              onClick={onBack}
              className="flex h-[36px] w-[36px] sm:h-[40px] sm:w-[40px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            >
              <span className="text-[16px]">←</span>
            </button>
          ) : (
            <div
              className="flex h-[36px] w-[36px] sm:h-[42px] sm:w-[42px] flex-shrink-0 items-center justify-center rounded-full border-[2px] border-[var(--gold)] bg-[var(--red)] text-[14px] sm:text-[18px] font-bold text-white shadow-[0_4px_12px_rgba(192,17,31,0.3)]"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              TX
            </div>
          )}
          <div>
            <h1
              className="text-[14px] sm:text-[18px] font-bold leading-tight text-white"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}
            >
              Dream Sheet
            </h1>
            <div
              className="hidden sm:block text-[9px] font-medium text-[var(--gold)]"
              style={{ letterSpacing: "2.5px", textTransform: "uppercase", opacity: 0.7 }}
            >
              2026 Texas Rangers
            </div>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-1">
          {!isHome && (
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white/40 transition hover:bg-white/[0.06] hover:text-white/70"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              <Home className="h-3.5 w-3.5" /> Home
            </button>
          )}
          {!isMyGames && (
            <button
              onClick={() => navigate("/MyGames")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[var(--gold)]/60 transition hover:bg-[rgba(191,160,72,0.08)] hover:text-[var(--gold)]"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              <CalendarDays className="h-3.5 w-3.5" /> My Games
            </button>
          )}
        </div>
      </div>
    </header>
  );
}