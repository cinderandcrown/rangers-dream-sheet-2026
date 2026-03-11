import React, { useState } from "react";

export default function EmailLoginModal({ memberName, onConfirm, onCancel }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-[420px] rounded-2xl border border-white/10 p-8"
        style={{ backgroundColor: "#1E293B" }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/15 text-2xl font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif", backgroundColor: "var(--red)" }}
          >
            {memberName[0]}
          </div>
          <h3
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Welcome, {memberName}
          </h3>
          <p className="mt-2 text-sm text-white/50">
            Enter your email address to access your Dream Sheet. This will be used for notifications about your game assignments.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="your@email.com"
            autoFocus
            className="mb-2 w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
          />
          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-white/10 bg-transparent py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)]"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", background: "linear-gradient(135deg, var(--red), #8B0000)" }}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}