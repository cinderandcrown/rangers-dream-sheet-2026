import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, CalendarDays, Star, Shield } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/MyGames", label: "My Games", icon: CalendarDays },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on Rank page (needs full screen) or admin
  const hiddenPaths = ["/Rank", "/Admin", "/Schedule"];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/[0.06]"
      style={{
        background: "linear-gradient(to top, rgba(10,22,40,0.98), rgba(10,22,40,0.95))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto flex max-w-[400px] items-center justify-around px-4 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 px-5 py-2 transition-all"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-[rgba(191,160,72,0.15)] text-[var(--gold)]"
                    : "text-white/30 group-hover:text-white/50"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span
                className={`text-[9px] font-semibold tracking-[1px] transition-all ${
                  isActive ? "text-[var(--gold)]" : "text-white/25 group-hover:text-white/40"
                }`}
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}