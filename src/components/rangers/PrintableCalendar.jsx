import React from "react";
import { parseISO, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { getTeamColor, getTeamAbbreviation } from "./utils";
import { Printer } from "lucide-react";

function buildCalendarGrid(year, monthIndex) {
  const start = startOfWeek(startOfMonth(new Date(year, monthIndex)), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(new Date(year, monthIndex)), { weekStartsOn: 0 });
  const days = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

function CalendarMonth({ year, monthIndex, monthName, games, memberName, accentColor }) {
  const days = buildCalendarGrid(year, monthIndex);
  const gamesByDate = {};
  games.forEach((g) => {
    const key = g.date;
    gamesByDate[key] = g;
  });

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="calendar-month" style={{ pageBreakInside: "avoid", marginBottom: "24px" }}>
      {/* Month header */}
      <div
        style={{
          background: "#003278",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "10px 10px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "20px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>
          {monthName} 2026
        </div>
        <div style={{ fontSize: "12px", opacity: 0.7 }}>
          {games.length} game{games.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Day headers */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <th
                key={d}
                style={{
                  width: "14.28%",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontFamily: "'Oswald', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#666",
                  borderBottom: "2px solid #C0111F",
                  textAlign: "center",
                  background: "#f8f8f8",
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                const inMonth = isSameMonth(day, new Date(year, monthIndex));
                const dateKey = format(day, "yyyy-MM-dd");
                const game = gamesByDate[dateKey];
                const isWeekend = di === 0 || di === 5 || di === 6;

                return (
                  <td
                    key={di}
                    style={{
                      border: "1px solid #e5e5e5",
                      padding: "3px",
                      verticalAlign: "top",
                      height: "72px",
                      background: !inMonth ? "#f5f5f5" : isWeekend ? "#fafafa" : "#fff",
                    }}
                  >
                    {inMonth && (
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: game ? "#003278" : "#999",
                            fontWeight: game ? 700 : 400,
                            padding: "1px 3px",
                            fontFamily: "'Source Sans 3', sans-serif",
                          }}
                        >
                          {format(day, "d")}
                        </div>
                        {game && (
                          <div
                            style={{
                              marginTop: "2px",
                              padding: "3px 4px",
                              borderRadius: "5px",
                              background: getTeamColor(game.opponent),
                              color: "#fff",
                              fontSize: "9px",
                              fontFamily: "'Oswald', sans-serif",
                              textTransform: "uppercase",
                              letterSpacing: "0.3px",
                              lineHeight: "1.3",
                              textAlign: "center",
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>vs {getTeamAbbreviation(game.opponent)}</div>
                            <div style={{ fontSize: "8px", opacity: 0.85, fontFamily: "'Source Sans 3', sans-serif" }}>
                              {game.start_time}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrintableCalendar({ memberName, accentColor, memberGames, onClose }) {
  const monthOrder = [
    { name: "April", index: 3 },
    { name: "May", index: 4 },
    { name: "June", index: 5 },
    { name: "July", index: 6 },
    { name: "August", index: 7 },
    { name: "September", index: 8 },
  ];

  const gamesByMonth = {};
  memberGames.forEach((g) => {
    if (!gamesByMonth[g.month]) gamesByMonth[g.month] = [];
    gamesByMonth[g.month].push(g);
  });

  const weekendCount = memberGames.filter((g) => ["Fri", "Sat", "Sun"].includes(g.day_of_week)).length;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const calendarEl = document.getElementById("printable-calendar-content");
    printWindow.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${memberName}'s Rangers 2026 Calendar</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Source Sans 3', Arial, sans-serif; background: #fff; color: #333; padding: 20px; }
  @media print {
    body { padding: 12px; }
    .calendar-month { page-break-inside: avoid; }
    .no-print { display: none !important; }
  }
  @page { margin: 0.4in; size: letter; }
  table { width: 100%; border-collapse: collapse; }
</style>
</head><body>
${calendarEl.innerHTML}
</body></html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative my-6 w-full max-w-[800px] rounded-2xl bg-white p-4 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "22px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#003278" }}
          >
            🗓️ Printable Calendar
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #C0111F, #8B0000)", fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* Calendar content */}
        <div id="printable-calendar-content">
          {/* Title banner */}
          <div
            style={{
              background: "#003278",
              borderLeft: `6px solid ${accentColor}`,
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "24px",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  {memberName}'s 2026 Rangers Schedule
                </div>
                <div style={{ fontSize: "14px", opacity: 0.7, marginTop: "4px" }}>
                  {memberGames.length} Home Games · Globe Life Field · Arlington, TX
                </div>
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 700,
                  fontFamily: "'Oswald', sans-serif",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {memberName[0]}
              </div>
            </div>
            {/* Quick stats bar */}
            <div style={{ display: "flex", gap: "24px", marginTop: "12px", fontSize: "12px" }}>
              <div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: 700 }}>{memberGames.length}</span>
                <span style={{ marginLeft: "4px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "1px", fontSize: "10px" }}>Total</span>
              </div>
              <div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: 700, color: "#BFA048" }}>{weekendCount}</span>
                <span style={{ marginLeft: "4px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "1px", fontSize: "10px" }}>Weekend</span>
              </div>
              <div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: 700 }}>{memberGames.length - weekendCount}</span>
                <span style={{ marginLeft: "4px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "1px", fontSize: "10px" }}>Weekday</span>
              </div>
            </div>
          </div>

          {/* Month grids — 2 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {monthOrder
              .filter((mo) => gamesByMonth[mo.name])
              .map((mo) => (
                <CalendarMonth
                  key={mo.name}
                  year={2026}
                  monthIndex={mo.index}
                  monthName={mo.name}
                  games={gamesByMonth[mo.name] || []}
                  memberName={memberName}
                  accentColor={accentColor}
                />
              ))}
          </div>

          {/* Game list at bottom */}
          <div style={{ marginTop: "28px", borderTop: "2px solid #003278", paddingTop: "16px" }}>
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "#003278",
                marginBottom: "10px",
              }}
            >
              Complete Game List
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", fontSize: "11px" }}>
              {memberGames.map((g, i) => (
                <div
                  key={g.game_number}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 8px",
                    background: i % 2 === 0 ? "#f8f9fa" : "#fff",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: getTeamColor(g.opponent),
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: "#003278", minWidth: "65px" }}>
                    {format(parseISO(g.date), "EEE MMM d")}
                  </span>
                  <span style={{ color: "#555" }}>vs {g.opponent}</span>
                  <span style={{ marginLeft: "auto", color: "#888", fontSize: "10px" }}>{g.start_time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "9px",
              color: "#aaa",
              fontFamily: "'Source Sans 3', sans-serif",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Rangers Dream Sheet 2026 · Generated {format(new Date(), "MMMM d, yyyy")}
          </div>
        </div>
      </div>
    </div>
  );
}