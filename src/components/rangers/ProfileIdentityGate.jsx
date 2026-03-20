import React from "react";
import { User, ShieldAlert } from "lucide-react";
import BrandHeader from "./BrandHeader";

export default function ProfileIdentityGate({ members, onConfirm }) {
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember) {
      setError("Please choose your profile first");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    onConfirm({ member: selectedMember, email: email.trim().toLowerCase() });
  };

  return (
    <div>
      <BrandHeader />
      <div className="mx-auto max-w-[560px] px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[#003278] px-6 py-6">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.08] text-[var(--gold)]">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-[24px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}>
            Profile Settings
          </h1>
          <p className="mt-2 text-[14px] text-white/65">
            Verify your profile to manage your account settings and delete your personal app data.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-4 sm:p-5">
          <div className="mb-4">
            <div className="mb-3 text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
              Choose your profile
            </div>
            <div className="grid gap-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    setSelectedMember(member);
                    setError("");
                  }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    selectedMember?.id === member.id
                      ? "border-white/[0.18] bg-white/[0.08]"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: member.accent_color }}>
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {member.name}
                    </div>
                    <div className="text-[12px] text-white/35">{member.share_count} games · rank {member.rank_max}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2 text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
            Confirm your email
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4">
            <User className="h-4 w-4 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="your@email.com"
              className="w-full bg-transparent py-3 text-[15px] text-white placeholder-white/25 outline-none"
            />
          </div>

          {error && <p className="mt-3 text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            className="btn-red-gradient mt-5 w-full rounded-xl py-3 text-[14px] font-semibold text-white"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1.5px" }}
          >
            Continue to Settings
          </button>
        </form>
      </div>
    </div>
  );
}