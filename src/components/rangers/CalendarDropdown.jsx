import React, { useRef, useEffect } from "react";
import { CalendarPlus, ChevronDown } from "lucide-react";
import {
  generateSingleGameIcs,
  generateAllGamesIcs,
  downloadIcsFile,
  generateGoogleCalUrl,
  generateOutlookCalUrl,
} from "./icsGenerator";

const APPLE_ICON = (
  <svg viewBox="0 0 384 512" className="h-4 w-4 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.1 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
);
const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
);
const OUTLOOK_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.583a.793.793 0 01-.584.238h-8.322V6.566h8.322c.23 0 .424.08.584.238.158.159.238.353.238.583zM13.728 2.468V6.06H8.089l-1.078-.909-4.988-4.2a.746.746 0 01.494-.183h10.588c.23 0 .424.08.584.238a.807.807 0 01.039.462zm0 4.598v11.648c0 .148-.04.278-.119.39l-5.2-4.378-.32-.269-1.078-.908L2.023 9.56V5.16l4.988 4.201 1.078.909 5.64 4.75V7.066zm-13.575.5v12.307c0 .23.08.424.238.584.159.158.353.238.584.238h12.553v-4.338L8.089 11.46 7.011 10.55 2.023 6.35V5.966l-.87-.733a.803.803 0 00-.397.33.77.77 0 00-.103.403z"/><path fill="#0078D4" d="M7.011 10.551l1.078.908.32.269 5.2 4.378a.756.756 0 01-.119.39.793.793 0 01-.584.238H.975a.793.793 0 01-.584-.238.793.793 0 01-.238-.584V7.566c0-.146.035-.277.103-.403a.803.803 0 01.397-.33l.87.733 1.5 1.264z"/></svg>
);

/**
 * A dropdown button that lets users choose Apple Calendar (.ics), Google Calendar, or Outlook.
 *
 * Props:
 *  - game: single game object (for per-game buttons)
 *  - games: array of game objects (for "export all" button)
 *  - memberName: string
 *  - variant: "icon" (small icon button) | "button" (full-width labeled button)
 *  - label: custom label for button variant
 *  - onToast: optional toast callback
 */
export default function CalendarDropdown({ game, games, memberName, variant = "icon", label, onToast }) {
  const [open, setOpen] = React.useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [open]);

  const handleApple = async (e) => {
    e.stopPropagation();
    setOpen(false);
    if (games) {
      const ics = generateAllGamesIcs(games, memberName);
      await downloadIcsFile(ics, `${memberName.toLowerCase()}-rangers-2026.ics`);
    } else if (game) {
      const ics = generateSingleGameIcs(game, memberName);
      await downloadIcsFile(ics, `rangers-vs-${game.opponent.toLowerCase().replace(/\s+/g, "-")}.ics`);
    }
    if (onToast) onToast("Apple Calendar opened!");
  };

  const handleGoogle = (e) => {
    e.stopPropagation();
    setOpen(false);
    if (games) {
      // Google only supports single events — open first game, toast instruction
      window.open(generateGoogleCalUrl(games[0], memberName), "_blank");
      if (onToast) onToast("Google Calendar opened — add games one at a time, or use Apple/iCal for bulk");
    } else if (game) {
      window.open(generateGoogleCalUrl(game, memberName), "_blank");
      if (onToast) onToast("Google Calendar opened!");
    }
  };

  const handleOutlook = (e) => {
    e.stopPropagation();
    setOpen(false);
    if (games) {
      window.open(generateOutlookCalUrl(games[0], memberName), "_blank");
      if (onToast) onToast("Outlook opened — add games one at a time, or use Apple/iCal for bulk");
    } else if (game) {
      window.open(generateOutlookCalUrl(game, memberName), "_blank");
      if (onToast) onToast("Outlook Calendar opened!");
    }
  };

  const toggleOpen = (e) => {
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const menuItems = [
    { icon: APPLE_ICON, label: "Apple / iCal", sublabel: ".ics file for Apple", onClick: handleApple },
    { icon: GOOGLE_ICON, label: "Google Calendar", sublabel: "Best on Android", onClick: handleGoogle },
    { icon: OUTLOOK_ICON, label: "Outlook", sublabel: "Web link", onClick: handleOutlook },
  ];

  return (
    <div ref={ref} className="relative">
      {variant === "icon" ? (
        <button
          onClick={toggleOpen}
          aria-label="Add to calendar"
          className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/35 transition hover:bg-[rgba(191,160,72,0.15)] hover:text-[var(--gold)] hover:scale-105 active:scale-95"
        >
          <CalendarPlus className="h-[18px] w-[18px]" />
        </button>
      ) : (
        <button
          onClick={toggleOpen}
          aria-label={label || "Add to calendar"}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(191,160,72,0.2)] bg-[rgba(191,160,72,0.06)] min-h-[48px] py-3 text-[12px] sm:text-[13px] font-semibold text-[var(--gold)] transition hover:border-[rgba(191,160,72,0.35)] hover:bg-[rgba(191,160,72,0.1)]"
          style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          <CalendarPlus className="h-4 w-4" />
          {label || "Add to Calendar"}
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      {open && (
        <div
          className="absolute z-[200] mt-1 w-[220px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#1a2744] shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
          style={{ right: variant === "icon" ? 0 : "auto", left: variant === "icon" ? "auto" : 0 }}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center gap-3 px-4 min-h-[48px] py-3 text-left transition hover:bg-white/[0.06] active:bg-white/[0.08]"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                {item.icon}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">{item.label}</div>
                <div className="text-[10px] text-white/40">{item.sublabel}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}