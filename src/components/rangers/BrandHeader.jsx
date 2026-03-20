import React from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, ChevronLeft, Home, User } from "lucide-react";
import { useTabNavigation } from "@/lib/TabNavigationContext";

const SUB_ROUTES = {
  "/Index": "/",
  "/MyGames": "/",
  "/Rank": "/",
  "/Admin": "/",
  "/Schedule": "/Admin",
};

export default function BrandHeader({ showBack, onBack }) {
  const location = useLocation();
  const { activeTab, pop, switchTab } = useTabNavigation();
  const isHomeScreen = location.pathname === "/" || location.pathname === "/Index";
  const isHomeTab = activeTab === "home";
  const isMyGamesTab = activeTab === "myGames";
  const isProfileTab = activeTab === "profile";

  const autoBackTarget = SUB_ROUTES[location.pathname];
  const shouldShowBack = showBack || (!isHomeScreen && Boolean(autoBackTarget));
  const handleBack = onBack || (() => pop(autoBackTarget || "/"));

  return (
    <header
      className="sticky top-0 z-[100]"
      role="banner"
      style={{
        background: "linear-gradient(135deg, var(--navy), #001845)",
        borderBottom: "3px solid var(--red)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03) inset",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center gap-3">
          {shouldShowBack ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div
              className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full border-[2px] border-[var(--gold)] bg-[var(--red)] text-[16px] font-bold text-white shadow-[0_4px_12px_rgba(192,17,31,0.3)]"
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
              My 2026 Rangers Schedule
            </h1>
            <div
              className="hidden sm:block text-[9px] font-medium text-[var(--gold)]"
              style={{ letterSpacing: "2.5px", textTransform: "uppercase", opacity: 0.7 }}
            >
              2026 Texas Rangers
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {!isHomeTab && (
            <button
              onClick={() => switchTab("home")}
              aria-label="Navigate to Home"
              className="flex items-center gap-1.5 rounded-lg px-3 min-h-[44px] text-[11px] font-semibold text-white/40 transition hover:bg-white/[0.06] hover:text-white/70"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              <Home className="h-4 w-4" /> Home
            </button>
          )}
          {!isMyGamesTab && (
            <button
              onClick={() => switchTab("myGames")}
              aria-label="Navigate to My Games"
              className="flex items-center gap-1.5 rounded-lg px-3 min-h-[44px] text-[11px] font-semibold text-[var(--gold)]/60 transition hover:bg-[rgba(191,160,72,0.08)] hover:text-[var(--gold)]"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              <CalendarDays className="h-4 w-4" /> My Games
            </button>
          )}
          {!isProfileTab && (
            <button
              onClick={() => switchTab("profile")}
              aria-label="Navigate to Profile"
              className="flex items-center gap-1.5 rounded-lg px-3 min-h-[44px] text-[11px] font-semibold text-white/40 transition hover:bg-white/[0.06] hover:text-white/70"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              <User className="h-4 w-4" /> Profile
            </button>
          )}
        </div>
      </div>
    </header>
  );
}