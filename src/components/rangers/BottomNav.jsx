import React from "react";
import { useLocation } from "react-router-dom";
import { Home, CalendarDays } from "lucide-react";
import { useTabNavigation } from "@/lib/TabNavigationContext";

const NAV_ITEMS = [
  { tab: "home", label: "Home", icon: Home },
  { tab: "myGames", label: "My Games", icon: CalendarDays },
];

export default function BottomNav() {
  const location = useLocation();
  const { activeTab, switchTab } = useTabNavigation();

  const hiddenPaths = ["/Rank", "/Admin", "/Schedule"];
  if (hiddenPaths.some((path) => location.pathname.startsWith(path))) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/[0.06]"
      role="navigation"
      aria-label="Main navigation"
      style={{
        background: "linear-gradient(to top, rgba(10,22,40,0.98), rgba(10,22,40,0.95))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      <div className="mx-auto flex max-w-[400px] items-center justify-around px-4 py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;

          return (
            <button
              key={item.tab}
              onClick={() => switchTab(item.tab)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className="group flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 px-6 py-2 transition-all"
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