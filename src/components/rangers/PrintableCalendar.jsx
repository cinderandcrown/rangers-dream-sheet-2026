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
    <div className="calendar-month" style={{ pageBreakInside: "avoid", marginBottom: "8px" }}>
      {/* Month header */}
      <div
        style={{
          background: "#003278",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px 6px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>
          {monthName}
        </div>
        <div style={{ fontSize: "10px", opacity: 0.7 }}>
          {games.length}
        </div>
      </div>

      {/* Day headers */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
        <thead>
          <tr>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <th
                key={i}
                style={{
                  width: "14.28%",
                  padding: "2px",
                  fontSize: "8px",
                  fontFamily: "'Oswald', sans-serif",
                  textTransform: "uppercase",
                  color: "#888",
                  borderBottom: "1px solid #C0111F",
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
                      border: "1px solid #e8e8e8",
                      padding: "1px",
                      verticalAlign: "top",
                      height: "44px",
                      background: !inMonth ? "#f5f5f5" : isWeekend ? "#fafafa" : "#fff",
                    }}
                  >
                    {inMonth && (
                      <div>
                        <div
                          style={{
                            fontSize: "8px",
                            color: game ? "#003278" : "#aaa",
                            fontWeight: game ? 700 : 400,
                            padding: "0 2px",
                            lineHeight: "1.2",
                          }}
                        >
                          {format(day, "d")}
                        </div>
                        {game && (
                          <div
                            style={{
                              marginTop: "1px",
                              padding: "2px 2px",
                              borderRadius: "3px",
                              background: getTeamColor(game.opponent),
                              color: "#fff",
                              fontSize: "7px",
                              fontFamily: "'Oswald', sans-serif",
                              textTransform: "uppercase",
                              letterSpacing: "0.2px",
                              lineHeight: "1.2",
                              textAlign: "center",
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{getTeamAbbreviation(game.opponent)}</div>
                            <div style={{ fontSize: "6px", opacity: 0.85 }}>
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
  body { font-family: 'Source Sans 3', Arial, sans-serif; background: #fff; color: #333; padding: 10px; }
  @media print {
    body { padding: 6px; }
    .calendar-month { page-break-inside: avoid; }
    .no-print { display: none !important; }
  }
  @page { margin: 0.25in; size: letter; }
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
          {/* Compact title banner */}
          <div
            style={{
              background: "#003278",
              borderLeft: `4px solid ${accentColor}`,
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "10px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                {memberName}'s 2026 Rangers Schedule
              </div>
              <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "2px" }}>
                {memberGames.length} Games · Globe Life Field · {weekendCount} Weekend / {memberGames.length - weekendCount} Weekday
              </div>
            </div>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "'Oswald', sans-serif",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {memberName[0]}
            </div>
          </div>

          {/* Month grids — 2 columns compact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
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

          {/* Compact game list */}
          <div style={{ marginTop: "8px", borderTop: "1px solid #003278", paddingTop: "6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", fontSize: "8px" }}>
              {memberGames.map((g) => (
                <div
                  key={g.game_number}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 4px",
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: getTeamColor(g.opponent),
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: "#003278" }}>
                    {format(parseISO(g.date), "M/d")}
                  </span>
                  <span style={{ color: "#666" }}>{g.opponent}</span>
                  <span style={{ marginLeft: "auto", color: "#999", fontSize: "7px" }}>{g.start_time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "6px",
              textAlign: "center",
              fontSize: "7px",
              color: "#bbb",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Rangers Dream Sheet 2026 · {format(new Date(), "MMM d, yyyy")}
          </div>
        </div>
      </div>
    </div>
  );
}