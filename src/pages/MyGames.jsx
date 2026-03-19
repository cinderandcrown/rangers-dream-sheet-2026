import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Download, ChevronDown, ChevronUp, Printer } from "lucide-react";
import BrandHeader from "@/components/rangers/BrandHeader";
import LoadingScreen from "@/components/rangers/LoadingScreen";
import AppToast from "@/components/rangers/AppToast";
import MyGameCard from "@/components/rangers/MyGameCard";
import MemberLoginGate from "@/components/rangers/MemberLoginGate";
import GameDetailModal from "@/components/rangers/GameDetailModal";
import useSeedData from "@/components/rangers/useSeedData";
import { parseISO, format } from "date-fns";
import { sortGames, sortMembers } from "@/components/rangers/utils";
import { getMemberScheduleData, downloadMemberExcel } from "@/components/rangers/scheduleExports";
import { downloadMemberScheduleCsv } from "@/components/rangers/adminHelpers";
import { generateAllGamesIcs, downloadIcsFile } from "@/components/rangers/icsGenerator";
import PrintableCalendar from "@/components/rangers/PrintableCalendar";
import NextGameSpotlight from "@/components/rangers/NextGameSpotlight";
import ShareSchedule from "@/components/rangers/ShareSchedule";

export default function MyGames() {
  const navigate = useNavigate();
  const seedQuery = useSeedData();
  const [authedMember, setAuthedMember] = React.useState(null);
  const [authedEmail, setAuthedEmail] = React.useState(null);
  const [toast, setToast] = React.useState("");
  const [detailGame, setDetailGame] = React.useState(null);
  const [expandedMonth, setExpandedMonth] = React.useState(null);
  const [showPrintCalendar, setShowPrintCalendar] = React.useState(false);

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: () => base44.entities.Member.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const gamesQuery = useQuery({ queryKey: ["games"], queryFn: () => base44.entities.Game.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const allocationsQuery = useQuery({ queryKey: ["allocations"], queryFn: () => base44.entities.Allocation.list(), enabled: seedQuery.isSuccess, initialData: [] });
  const submissionsQuery = useQuery({ queryKey: ["submissions"], queryFn: () => base44.entities.Submission.list(), enabled: seedQuery.isSuccess, initialData: [] });

  const members = sortMembers(membersQuery.data);
  const games = sortGames(gamesQuery.data);
  const allocations = allocationsQuery.data;
  const submissions = submissionsQuery.data;

  const isLoading = seedQuery.isLoading || membersQuery.isLoading || gamesQuery.isLoading || allocationsQuery.isLoading || submissionsQuery.isLoading;

  // Build enriched game list with allocation metadata
  const memberAllocations = authedMember ? allocations.filter((a) => a.assigned_to === authedMember.name) : [];
  const allocationByGame = Object.fromEntries(memberAllocations.map((a) => [a.game_number, a]));
  const memberGames = authedMember ? getMemberScheduleData(authedMember.name, games, allocations) : [];

  const groupGames = memberGames.filter((g) => (allocationByGame[g.game_number]?.ticket_type || "group") === "group");
  const personalGames = memberGames.filter((g) => allocationByGame[g.game_number]?.ticket_type === "personal");

  // Group by month
  const monthGroups = {};
  memberGames.forEach((g) => {
    if (!monthGroups[g.month]) monthGroups[g.month] = [];
    monthGroups[g.month].push(g);
  });
  const monthOrder = ["April", "May", "June", "July", "August", "September"];
  const orderedMonths = monthOrder.filter((m) => monthGroups[m]);

  // Stats
  const weekendCount = memberGames.filter((g) => ["Fri", "Sat", "Sun"].includes(g.day_of_week)).length;
  const dayGameCount = memberGames.filter((g) => g.is_day_game).length;

  // Initialize all months expanded
  React.useEffect(() => {
    if (orderedMonths.length > 0 && expandedMonth === null) {
      setExpandedMonth("all");
    }
  }, [orderedMonths.length]);

  const toggleMonth = (month) => {
    setExpandedMonth((prev) => (prev === month ? "all" : month));
  };

  const [calExporting, setCalExporting] = React.useState(false);

  const handleExportAll = async () => {
    if (!authedMember || calExporting) return;
    setCalExporting(true);
    const ics = generateAllGamesIcs(memberGames, authedMember.name);
    await downloadIcsFile(ics, `${authedMember.name.toLowerCase()}-rangers-2026.ics`);
    setCalExporting(false);
    setToast("Calendar opened — tap Add to save all games!");
  };

  if (isLoading) return <LoadingScreen />;

  // Login gate
  if (!authedMember) {
    return (
      <MemberLoginGate
        members={members}
        onLogin={(member, email) => {
          const sub = submissions.find((s) => s.member_name === member.name);
          if (sub && sub.member_email && sub.member_email.toLowerCase() !== email.toLowerCase()) {
            setToast("Email doesn't match — use the email from your submission");
            return;
          }
          setAuthedMember(member);
          setAuthedEmail(email);
        }}
      />
    );
  }

  if (allocations.length === 0) {
    return (
      <div>
        <BrandHeader showBack onBack={() => setAuthedMember(null)} />
        <div className="mx-auto max-w-[600px] px-6 py-16 text-center">
          <div
            className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full border-[2px] border-[var(--gold)] bg-[var(--red)] text-[24px] font-bold text-white shadow-[0_4px_12px_rgba(192,17,31,0.3)]"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            TX
          </div>
          <h2
            className="text-xl font-bold text-white/80 mb-2"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Schedule Coming Soon
          </h2>
          <p className="text-white/50 text-[14px] mb-6">Your schedule hasn't been published yet. Clark will run the allocation after the deadline — check back soon! 🏟️</p>
          <button
            onClick={() => setAuthedMember(null)}
            className="rounded-lg border border-white/15 px-5 min-h-[44px] py-2.5 text-sm text-white/70 hover:text-white transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (memberGames.length === 0) {
    return (
      <div>
        <BrandHeader showBack onBack={() => setAuthedMember(null)} />
        <div className="mx-auto max-w-[600px] px-6 py-16 text-center">
          <div className="text-[48px] mb-4">🤔</div>
          <h2
            className="text-xl font-bold text-white/80 mb-2"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            No Games Assigned
          </h2>
          <p className="text-white/50 text-[14px]">No games are assigned to {authedMember.name} yet. This may be an error — contact Clark.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BrandHeader showBack onBack={() => setAuthedMember(null)} />

      <div className="relative z-[1] mx-auto max-w-[680px] px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div
          className="mb-6 overflow-hidden rounded-2xl px-6 sm:px-8 py-6 sm:py-7"
          style={{ background: "#003278", borderLeft: `6px solid ${authedMember.accent_color}` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-[22px] sm:text-[28px] font-bold text-white"
                style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}
              >
                {authedMember.name}'s Games
              </h1>
              <p className="mt-1 text-[13px] sm:text-[14px] text-white/70">
                {groupGames.length} group games{personalGames.length > 0 ? ` + ${personalGames.length} personal` : ""} · 2026 Season
              </p>
            </div>
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white"
              style={{ background: authedMember.accent_color }}
            >
              {authedMember.name[0]}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.08] px-3 py-2.5 text-center">
              <div className="text-[18px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>{groupGames.length}{personalGames.length > 0 ? <span className="text-[12px] text-[var(--gold)]">+{personalGames.length}</span> : null}</div>
              <div className="text-[10px] text-white/50" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</div>
            </div>
            <div className="rounded-xl bg-white/[0.08] px-3 py-2.5 text-center">
              <div className="text-[18px] font-bold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif" }}>{weekendCount}</div>
              <div className="text-[10px] text-white/50" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Weekend</div>
            </div>
            <div className="rounded-xl bg-white/[0.08] px-3 py-2.5 text-center">
              <div className="text-[18px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>{dayGameCount}</div>
              <div className="text-[10px] text-white/50" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Day Games</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleExportAll}
            disabled={calExporting}
            className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(191,160,72,0.2)] bg-[rgba(191,160,72,0.06)] min-h-[48px] py-3 text-[12px] sm:text-[13px] font-semibold text-[var(--gold)] transition hover:border-[rgba(191,160,72,0.35)] hover:bg-[rgba(191,160,72,0.1)] disabled:opacity-50"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            {calExporting ? (
              <div className="h-4 w-4 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin" />
            ) : (
              <CalendarDays className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Export to</span> Calendar
          </button>
          <button
            onClick={() => setShowPrintCalendar(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] min-h-[48px] py-3 text-[12px] sm:text-[13px] font-semibold text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/80"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            <Printer className="h-4 w-4" />
            Print Calendar
          </button>
          <button
            onClick={() => downloadMemberScheduleCsv(authedMember.name, games, allocations)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] min-h-[48px] py-3 text-[12px] sm:text-[13px] font-semibold text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/80"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => downloadMemberExcel(authedMember.name, authedMember.accent_color, games, allocations)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] min-h-[48px] py-3 text-[12px] sm:text-[13px] font-semibold text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/80"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
        </div>

        {/* Next Game Spotlight */}
        <NextGameSpotlight
          memberGames={memberGames}
          memberName={authedMember.name}
          accentColor={authedMember.accent_color}
          onToast={setToast}
        />

        {/* Month sections */}
        {orderedMonths.map((month) => {
          const monthGames = monthGroups[month];
          const isExpanded = expandedMonth === "all" || expandedMonth === month;

          return (
            <div key={month} className="mb-3 overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--slate)]">
              {/* Month header — clickable */}
              <button
                onClick={() => toggleMonth(month)}
                className="flex w-full items-center justify-between bg-white/[0.03] px-5 min-h-[48px] py-3 text-left transition hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-2">
                  <h3
                    className="text-[14px] font-semibold text-white"
                    style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
                  >
                    ⚾ {month}
                  </h3>
                  <span className="text-[12px] text-white/40">{monthGames.length} game{monthGames.length !== 1 ? "s" : ""}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-white/30" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white/30" />
                )}
              </button>

              {/* Game cards */}
              {isExpanded && (
                <div className="space-y-[1px] bg-white/[0.02] p-2 sm:p-3">
                  {monthGames.map((game) => (
                    <MyGameCard
                      key={game.game_number}
                      game={game}
                      memberName={authedMember.name}
                      onInfoClick={setDetailGame}
                      allocation={allocationByGame[game.game_number]}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Old next game highlight removed — replaced by NextGameSpotlight above */}

        {/* Share schedule */}
        <ShareSchedule
          memberName={authedMember.name}
          memberGames={memberGames}
          onToast={setToast}
        />

        {/* Tip */}
        <div className="mt-4 rounded-xl border border-white/[0.04] bg-white/[0.02] px-5 py-4">
          <p className="text-[12px] text-white/35 leading-relaxed">
            <strong className="text-white/50">Tip:</strong> Tap the <span className="text-[var(--gold)]">calendar icon</span> on any game to add it individually. Use <span className="text-white/50">Export to Calendar</span> for all games at once (.ics for Apple, Google, & Outlook), or <span className="text-white/50">Print Calendar</span> for a fridge-ready monthly view.
          </p>
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-20" />
      </div>

      {/* Game detail modal */}
      {detailGame && (
        <GameDetailModal
          game={detailGame}
          allocation={allocations.find((a) => a.game_number === detailGame.game_number)}
          members={members}
          onClose={() => setDetailGame(null)}
        />
      )}

      {/* Print calendar modal */}
      {showPrintCalendar && authedMember && (
        <PrintableCalendar
          memberName={authedMember.name}
          accentColor={authedMember.accent_color}
          memberGames={memberGames}
          onClose={() => setShowPrintCalendar(false)}
        />
      )}

      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}