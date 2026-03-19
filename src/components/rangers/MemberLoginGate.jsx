import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="mx-auto max-w-[540px] px-6 py-10">
          {/* Hero section */}
          <div className="mb-10 text-center">
            <div
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #003278, #001845)", border: "2px solid rgba(191,160,72,0.3)" }}
            >
              <span className="text-[36px]">⚾</span>
            </div>
            <h2
              className="text-[26px] font-bold text-white"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}
            >
              My Game Schedule
            </h2>
            <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-relaxed text-white/45">
              View your allocated games, export to your calendar, and print your season schedule
            </p>
          </div>

          {/* Member selection */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span
              className="text-[10px] font-semibold tracking-[2px] text-white/25"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              Who Are You?
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {members.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedMember(m)}
                className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-left transition-all hover:border-white/[0.15] hover:bg-white/[0.04] hover:shadow-lg hover:-translate-y-0.5"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-bold text-white shadow-lg transition group-hover:scale-105"
                  style={{ background: m.accent_color }}
                >
                  {m.name[0]}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[16px] font-semibold text-white"
                    style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
                  >
                    {m.name}
                  </div>
                  <div className="text-[12px] text-white/35">{m.share_count} games in the split</div>
                </div>
                <div className="text-[18px] text-white/15 transition group-hover:text-white/40 group-hover:translate-x-0.5">→</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BrandHeader showBack onBack={() => setSelectedMember(null)} />
      <div className="mx-auto max-w-[420px] px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Avatar */}
          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-[28px] font-bold text-white shadow-xl"
            style={{ background: selectedMember.accent_color, boxShadow: `0 8px 24px ${selectedMember.accent_color}50` }}
          >
            {selectedMember.name[0]}
          </div>
          <h2
            className="text-[22px] font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Hey, {selectedMember.name}
          </h2>
          <p className="mt-1.5 text-[13px] text-white/45">Enter the email you used to submit your rankings</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition focus-within:border-white/[0.2] focus-within:bg-white/[0.05]">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              autoFocus
              className="w-full bg-transparent px-4 py-4 text-[15px] text-white placeholder-white/25 outline-none"
            />
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2.5 text-[12px] text-red-400">
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            className="btn-red-gradient mt-5 w-full rounded-xl py-4 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1.5px" }}
          >
            View My Schedule →
          </button>
        </form>
      </div>
    </div>
  );
}