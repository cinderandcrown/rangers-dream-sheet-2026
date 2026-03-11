import React from "react";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-20 w-20">
          {/* Outer ring pulse */}
          <div
            className="absolute inset-0 rounded-full border-2 border-[var(--gold)]"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          {/* Inner logo */}
          <div
            className="absolute inset-[6px] flex items-center justify-center rounded-full border-[3px] border-[var(--gold)] bg-[var(--red)] text-[28px] font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            TX
          </div>
        </div>
        <div
          className="text-sm tracking-[6px] text-white/40"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          LOADING
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.15); }
          }
        `}</style>
      </div>
    </div>
  );
}