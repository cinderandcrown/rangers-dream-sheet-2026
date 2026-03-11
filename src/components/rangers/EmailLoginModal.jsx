import React, { useState, useEffect, useRef } from "react";

export default function EmailLoginModal({ memberName, onConfirm, onCancel }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onCancel, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 transition-all duration-200"
      style={{
        backgroundColor: show ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)",
        backdropFilter: show ? "blur(8px)" : "blur(0px)"
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.6)] transition-all duration-200"
        style={{
          backgroundColor: "rgba(30,41,59,0.95)",
          backdropFilter: "blur(24px)",
          transform: show ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          opacity: show ? 1 : 0
        }}
      >
        {/* Colored top strip */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, var(--red), var(--gold))" }} />

        <div className="p-7">
          {/* Header */}
          <div className="mb-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-[26px] font-bold text-white shadow-lg"
              style={{
                fontFamily: "'Oswald', sans-serif",
                background: "linear-gradient(135deg, var(--red), #8B0000)",
                border: "3px solid rgba(255,255,255,0.1)"
              }}
            >
              {memberName[0]}
            </div>
            <h3
              className="text-[20px] font-bold text-white"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              {memberName}'s Dream Sheet
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/45">
              Enter your email to access or create your game rankings. This email will be used for your assignment notifications.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label
              className="mb-2 block text-[11px] font-semibold tracking-[2px] text-white/30"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              Email Address
            </label>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              className="mb-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[14px] text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-[var(--gold)] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(191,160,72,0.1)]"
            />
            {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border border-white/[0.08] bg-transparent py-3 text-[13px] font-medium text-white/50 transition-all hover:border-white/15 hover:text-white/80"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl py-3 text-[13px] font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(192,17,31,0.35)]"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  background: "linear-gradient(135deg, var(--red), #8B0000)"
                }}
              >
                Continue →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}