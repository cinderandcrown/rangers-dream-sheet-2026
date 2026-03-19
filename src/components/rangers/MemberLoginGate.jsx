import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Star, Ticket } from "lucide-react";
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

  const totalGames = members.reduce((sum, m) => sum + (m.share_count || 0), 0);

  if (!selectedMember) {
    return (
      <div>
        <BrandHeader showBack onBack={() => navigate("/")} />

        {/* Visual hero banner */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(165deg, #003278 0%, #001845 50%, #0A1628 100%)" }}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, var(--red), transparent 70%)" }} />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, var(--gold), transparent 70%)" }} />
            {/* Diamond pattern */}
            <div className="absolute top-8 right-8 rotate-45 h-16 w-16 border border-white/[0.04] rounded-sm" />
            <div className="absolute bottom-6 left-12 rotate-45 h-10 w-10 border border-white/[0.03] rounded-sm" />
          </div>

          <div className="relative z-10 mx-auto max-w-[540px] px-6 pt-8 pb-10 text-center">
            {/* Icon trio */}
            <div className="mb-5 flex items-center justify-center gap-3">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] backdrop-blur-sm">
                <CalendarDays className="h-5 w-5 text-[var(--gold)]/70" />
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--gold)]/30"
                style={{ background: "linear-gradient(135deg, var(--red), #8B0000)" }}>
                <span className="text-[32px]">⚾</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] backdrop-blur-sm">
                <Ticket className="h-5 w-5 text-white/40" />
              </motion.div>
            </div>

            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="text-[28px] sm:text-[32px] font-bold text-white"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "3px" }}>
              My Game Schedule
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="mx-auto mt-2 max-w-[340px] text-[13px] leading-relaxed text-white/40">
              View your allocated games, export to calendar, and print your season schedule
            </motion.p>

            {/* Quick stats bar */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-6 flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-[20px] font-bold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif" }}>{members.length}</div>
                <div className="text-[9px] tracking-[1.5px] text-white/30" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Members</div>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-[20px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>{totalGames}</div>
                <div className="text-[9px] tracking-[1.5px] text-white/30" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Total Games</div>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-[20px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>2026</div>
                <div className="text-[9px] tracking-[1.5px] text-white/30" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Season</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Member selection */}
        <div className="mx-auto max-w-[540px] px-4 sm:px-6 py-6 pb-28">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span
              className="text-[10px] font-semibold tracking-[2px] text-white/25"
              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
              Select Your Profile
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {members.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06, ease: "easeOut" }}
                onClick={() => setSelectedMember(m)}
                className="group relative flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-left transition-all hover:border-white/[0.15] hover:bg-white/[0.05] hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 transition-opacity group-hover:opacity-100" style={{ background: m.accent_color }} />

                <div
                  className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-white shadow-lg transition group-hover:scale-105"
                  style={{ background: m.accent_color, boxShadow: `0 4px 16px ${m.accent_color}40` }}>
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[15px] font-semibold text-white truncate"
                    style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {m.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-white/35">{m.share_count} games</span>
                    <span className="text-white/10">·</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-[var(--gold)]/40" />
                      <span className="text-[11px] text-[var(--gold)]/40">Rank {m.rank_max}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[18px] text-white/10 transition group-hover:text-white/40 group-hover:translate-x-0.5">→</div>
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
      <div className="mx-auto max-w-[420px] px-6 py-10 pb-28">
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
            className="btn-red-gradient mt-5 w-full rounded-xl min-h-[48px] py-4 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)]"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1.5px" }}
          >
            View My Schedule →
          </button>
        </form>
      </div>
    </div>
  );
}