import React from "react";
import { useNavigate } from "react-router-dom";
import BrandHeader from "./BrandHeader";

export default function MemberLoginGate({ members, onLogin }) {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    onLogin(selectedMember, email.trim());
  };

  if (!selectedMember) {
    return (
      <div>
        <BrandHeader showBack onBack={() => navigate("/")} />
        <div className="mx-auto max-w-[500px] px-6 py-12">
          <div className="mb-8 text-center">
            <div className="text-[40px] mb-3">⚾</div>
            <h2
              className="text-[22px] font-bold text-white"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}
            >
              My Schedule
            </h2>
            <p className="mt-1 text-[14px] text-white/50">Select your name to view your games</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[var(--slate)] px-5 py-4 text-left transition hover:border-white/[0.15] hover:shadow-lg"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[16px] font-bold text-white"
                  style={{ background: m.accent_color }}
                >
                  {m.name[0]}
                </div>
                <div>
                  <div
                    className="text-[15px] font-semibold text-white"
                    style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
                  >
                    {m.name}
                  </div>
                  <div className="text-[12px] text-white/40">{m.share_count} games</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BrandHeader showBack onBack={() => setSelectedMember(null)} />
      <div className="mx-auto max-w-[420px] px-6 py-12">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-[24px] font-bold text-white"
            style={{ background: selectedMember.accent_color }}
          >
            {selectedMember.name[0]}
          </div>
          <h2
            className="text-[20px] font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Welcome, {selectedMember.name}
          </h2>
          <p className="mt-1 text-[13px] text-white/50">Enter the email you used to submit your rankings</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="your@email.com"
            autoFocus
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.06]"
          />
          {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
          <button
            type="submit"
            className="btn-red-gradient mt-4 w-full rounded-xl py-3.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            View My Schedule
          </button>
        </form>
      </div>
    </div>
  );
}