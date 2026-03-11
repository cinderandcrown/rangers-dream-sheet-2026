import React, { useState } from "react";

const ADMIN_CODE = "clark2026";

export default function AdminGate({ children }) {
  const [authorized, setAuthorized] = useState(() => {
    return sessionStorage.getItem("admin_auth") === "true";
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === ADMIN_CODE) {
      sessionStorage.setItem("admin_auth", "true");
      setAuthorized(true);
    } else {
      setError("Incorrect passcode");
      setCode("");
    }
  };

  if (authorized) return children;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div
        className="w-full max-w-[380px] rounded-2xl border border-white/10 p-8"
        style={{ backgroundColor: "#1E293B" }}
      >
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--gold)] text-2xl"
            style={{ background: "linear-gradient(135deg, var(--red), #8B0000)" }}
          >
            👑
          </div>
          <h3
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Admin Access
          </h3>
          <p className="mt-2 text-sm text-white/50">Enter the admin passcode to continue.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            placeholder="Passcode"
            autoFocus
            className="mb-2 w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
          />
          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="mt-3 w-full rounded-lg py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px", background: "linear-gradient(135deg, var(--red), #8B0000)" }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}