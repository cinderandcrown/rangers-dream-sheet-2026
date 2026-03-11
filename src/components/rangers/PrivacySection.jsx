import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PrivacySection({ members, submissionMap, onToast }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedMember) return;
    const submission = submissionMap[selectedMember];
    if (!submission) {
      onToast("No submission found for " + selectedMember);
      return;
    }
    if (submission.is_locked) {
      onToast("This submission is locked by admin. Contact Clark.");
      return;
    }
    // Verify email matches
    if (!confirmEmail.trim() || confirmEmail.trim().toLowerCase() !== (submission.member_email || "").toLowerCase()) {
      onToast("Email doesn't match. Please enter the email used when submitting.");
      return;
    }
    setDeleting(true);
    await base44.entities.Submission.delete(submission.id);
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    onToast(`${selectedMember}'s submission and email have been deleted.`);
    setSelectedMember("");
    setConfirmEmail("");
    setExpanded(false);
    setDeleting(false);
  };

  const submittedMembers = members.filter((m) => submissionMap[m.name]);

  return (
    <div className="mx-auto mt-12 max-w-[540px]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[12px] font-medium text-white/30 transition hover:border-white/[0.1] hover:text-white/50"
        style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase" }}
      >
        🔐 Privacy & Data
        <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div
          className="mt-3 overflow-hidden rounded-xl border border-white/[0.06] p-5"
          style={{ backgroundColor: "rgba(30,41,59,0.6)", backdropFilter: "blur(12px)" }}
        >
          <p className="mb-4 text-[13px] leading-relaxed text-white/40">
            You can delete your submission and email data at any time. This will remove your game rankings and the email address you provided. You'll be able to re-submit afterward.
          </p>

          {submittedMembers.length === 0 ? (
            <p className="text-center text-[13px] text-white/25">No submissions to delete.</p>
          ) : (
            <>
              <label
                className="mb-2 block text-[11px] font-semibold tracking-[2px] text-white/30"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
              >
                Select Your Name
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {submittedMembers.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => { setSelectedMember(m.name); setConfirmEmail(""); }}
                    className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition ${
                      selectedMember === m.name
                        ? "border-[var(--red)] bg-[rgba(192,17,31,0.15)] text-white"
                        : "border-white/[0.08] text-white/50 hover:border-white/15"
                    }`}
                    style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {selectedMember && (
                <>
                  <label
                    className="mb-2 block text-[11px] font-semibold tracking-[2px] text-white/30"
                    style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                  >
                    Confirm Your Email
                  </label>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Enter the email you used to submit"
                    className="mb-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none transition focus:border-[var(--red)] focus:bg-white/[0.06]"
                  />
                  <button
                    onClick={handleDelete}
                    disabled={deleting || !confirmEmail.trim()}
                    className="w-full rounded-xl border border-[var(--red)] bg-[rgba(192,17,31,0.15)] py-3 text-[13px] font-semibold text-[var(--red)] transition hover:bg-[rgba(192,17,31,0.25)] disabled:opacity-40"
                    style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
                  >
                    {deleting ? "Deleting…" : "Delete My Data"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}