import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";
import { RESERVED_GAME_NUMBER } from "./constants";
import { sortGames, getTeamColor } from "./utils";

// Member row background colors for Excel
const MEMBER_ROW_COLORS = {
  George: "D6E4F0",
  Sandy: "F2D7DB",
  Clark: "F5ECD7",
  Ed: "D6DFF0",
  Chase: "F0D6D6",
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

function formatFullDate(dateStr) {
  const d = parseISO(dateStr);
  return format(d, "EEEE, MMMM d, yyyy");
}

function formatTime12(timeStr) {
  return timeStr; // already in "3:05 PM" format
}

function getGameRows(games, allocations, memberFilter) {
  const ownerByGame = Object.fromEntries(allocations.map((a) => [a.game_number, a.assigned_to]));
  const sorted = sortGames(games);

  return sorted
    .filter((g) => {
      if (memberFilter) {
        return g.game_number !== RESERVED_GAME_NUMBER && ownerByGame[g.game_number] === memberFilter;
      }
      return true;
    })
    .map((g) => ({
      "START DATE": formatFullDate(g.date),
      "START TIME": formatTime12(g.start_time),
      "START TIME ET": formatTime12(g.start_time_et),
      SUBJECT: `${g.opponent} at Rangers`,
      LOCATION: "Globe Life Field - Arlington",
      Partner: g.game_number === RESERVED_GAME_NUMBER ? "Opening Day ★" : ownerByGame[g.game_number] || "",
      _game_number: g.game_number,
      _owner: ownerByGame[g.game_number],
    }));
}

function applyHeaderStyle(ws, colCount) {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) {
      ws[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 11 },
        fill: { fgColor: { rgb: "003278" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "D0D5DD" } },
          bottom: { style: "thin", color: { rgb: "D0D5DD" } },
          left: { style: "thin", color: { rgb: "D0D5DD" } },
          right: { style: "thin", color: { rgb: "D0D5DD" } },
        },
      };
    }
  }
}

function applyDataStyles(ws, startRow, endRow, colCount, getRowColor) {
  for (let r = startRow; r <= endRow; r++) {
    const color = getRowColor(r - startRow);
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { name: "Arial", sz: 10 },
          fill: color ? { fgColor: { rgb: color } } : undefined,
          border: {
            top: { style: "thin", color: { rgb: "D0D5DD" } },
            bottom: { style: "thin", color: { rgb: "D0D5DD" } },
            left: { style: "thin", color: { rgb: "D0D5DD" } },
            right: { style: "thin", color: { rgb: "D0D5DD" } },
          },
          alignment: c === 5 ? { horizontal: "center", font: { bold: true } } : undefined,
        };
      }
    }
  }
}

function cleanRows(rows) {
  return rows.map(({ _game_number, _owner, ...rest }) => rest);
}

export function downloadMasterExcel(games, allocations, submittedMembers) {
  const wb = XLSX.utils.book_new();

  // Master sheet
  const masterRows = getGameRows(games, allocations, null);
  const masterWs = XLSX.utils.json_to_sheet(cleanRows(masterRows));
  masterWs["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 26 }, { wch: 34 }, { wch: 14 }];
  masterWs["!autofilter"] = { ref: `A1:F${masterRows.length + 1}` };
  masterWs["!freeze"] = { xSplit: 0, ySplit: 1 };
  applyHeaderStyle(masterWs, 6);
  applyDataStyles(masterWs, 1, masterRows.length, 6, (i) => {
    const row = masterRows[i];
    if (row._game_number === RESERVED_GAME_NUMBER) return "FFF8E1";
    return MEMBER_ROW_COLORS[row._owner] || undefined;
  });
  XLSX.utils.book_append_sheet(wb, masterWs, "MasterList-2026");

  // Individual member sheets
  for (const member of submittedMembers) {
    const memberRows = getGameRows(games, allocations, member.name);
    const ws = XLSX.utils.json_to_sheet(cleanRows(memberRows));
    ws["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 26 }, { wch: 34 }, { wch: 14 }];
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    // Header with member accent color
    const accentHex = (member.accent_color || "#003278").replace("#", "");
    for (let c = 0; c < 6; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 11 },
          fill: { fgColor: { rgb: accentHex } },
          alignment: { horizontal: "center" },
          border: { top: { style: "thin", color: { rgb: "D0D5DD" } }, bottom: { style: "thin", color: { rgb: "D0D5DD" } }, left: { style: "thin", color: { rgb: "D0D5DD" } }, right: { style: "thin", color: { rgb: "D0D5DD" } } },
        };
      }
    }
    applyDataStyles(ws, 1, memberRows.length, 6, (i) => (i % 2 === 1 ? "F5F5F5" : undefined));
    XLSX.utils.book_append_sheet(wb, ws, member.name);
  }

  XLSX.writeFile(wb, "MasterSchedule-TexasRangersSeason-2026.xlsx");
}

export function downloadMemberExcel(memberName, accentColor, games, allocations) {
  const wb = XLSX.utils.book_new();
  const memberRows = getGameRows(games, allocations, memberName);
  const ws = XLSX.utils.json_to_sheet(cleanRows(memberRows));
  ws["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 26 }, { wch: 34 }, { wch: 14 }];
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  const accentHex = (accentColor || "#003278").replace("#", "");
  for (let c = 0; c < 6; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) {
      ws[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 11 },
        fill: { fgColor: { rgb: accentHex } },
        alignment: { horizontal: "center" },
        border: { top: { style: "thin", color: { rgb: "D0D5DD" } }, bottom: { style: "thin", color: { rgb: "D0D5DD" } }, left: { style: "thin", color: { rgb: "D0D5DD" } }, right: { style: "thin", color: { rgb: "D0D5DD" } } },
      };
    }
  }
  applyDataStyles(ws, 1, memberRows.length, 6, (i) => (i % 2 === 1 ? "F5F5F5" : undefined));
  XLSX.utils.book_append_sheet(wb, ws, memberName);
  XLSX.writeFile(wb, `${memberName}-TexasRangers-2026.xlsx`);
}

export function getMemberScheduleData(memberName, games, allocations) {
  const gameNumbers = allocations
    .filter((a) => a.assigned_to === memberName)
    .map((a) => a.game_number);
  return sortGames(games).filter((g) => gameNumbers.includes(g.game_number));
}

export function generateAllSchedulesHtml(members, games, allocations) {

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>All Schedules — Rangers 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Source Sans 3',Arial,sans-serif; background:#0A1628; color:#E2E8F0; min-height:100vh; padding:32px; }
  .container { max-width:740px; margin:0 auto; }
  .print-btn { position:fixed; top:16px; right:16px; background:linear-gradient(135deg,#C0111F,#8B0000); color:#fff; border:none; padding:10px 20px; border-radius:8px; font-family:'Oswald',sans-serif; font-size:13px; text-transform:uppercase; letter-spacing:1px; cursor:pointer; z-index:100; }
  @media print {
    body { background:#fff !important; color:#333 !important; padding:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .print-btn { display:none; }
    .member-section { page-break-after: always; }
    .member-section:last-child { page-break-after: auto; }
    .header-banner { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .month-card { break-inside: avoid; }
  }
  .header-banner { padding:28px 32px; border-radius:14px; margin-bottom:28px; }
  .header-banner h1 { font-family:'Oswald',sans-serif; font-size:28px; text-transform:uppercase; letter-spacing:2px; color:#fff; margin-bottom:4px; }
  .header-banner p { font-size:14px; color:rgba(255,255,255,0.7); }
  .month-card { background:#1E293B; border-radius:14px; border:1px solid rgba(255,255,255,0.06); margin-bottom:16px; overflow:hidden; }
  .month-header { padding:12px 20px; display:flex; justify-content:space-between; align-items:center; }
  .month-header h3 { font-family:'Oswald',sans-serif; font-size:16px; text-transform:uppercase; letter-spacing:1px; color:#fff; }
  .month-header span { font-size:13px; color:rgba(255,255,255,0.5); }
  .game-row { display:grid; grid-template-columns:130px 1fr 90px 60px; padding:10px 20px; border-top:1px solid rgba(255,255,255,0.04); font-size:14px; align-items:center; }
  .game-row:nth-child(even) { background:rgba(255,255,255,0.015); }
  .game-row .date { color:rgba(255,255,255,0.8); }
  .game-row .opponent { display:flex; align-items:center; gap:8px; }
  .game-row .team-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .game-row .time { color:rgba(255,255,255,0.6); text-align:right; }
  .wknd-tag { font-size:10px; font-family:'Oswald',sans-serif; background:rgba(191,160,72,0.2); color:#BFA048; padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px; }
  .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:24px; }
  .stat-card { background:#1E293B; border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:16px; text-align:center; }
  .stat-card .num { font-family:'Oswald',sans-serif; font-size:24px; color:#BFA048; }
  .stat-card .label { font-size:11px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; margin-top:4px; }
  @media print {
    .month-card { background:#f8f9fa !important; border:1px solid #ddd !important; }
    .month-header { background:#003278 !important; }
    .month-header h3, .month-header span { color:#fff !important; }
    .game-row { color:#333 !important; border-color:#eee !important; }
    .game-row .date, .game-row .opponent { color:#333 !important; }
    .game-row .time { color:#666 !important; }
    .stat-card { background:#f8f9fa !important; border:1px solid #ddd !important; }
    .stat-card .num { color:#003278 !important; }
    .stat-card .label { color:#666 !important; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨 Print All</button>
<div class="container">`;

  for (const member of members) {
    const memberGames = getMemberScheduleData(member.name, games, allocations);
    const months = {};
    memberGames.forEach((g) => {
      if (!months[g.month]) months[g.month] = [];
      months[g.month].push(g);
    });
    const weekendCount = memberGames.filter((g) => ["Fri", "Sat", "Sun"].includes(g.day_of_week)).length;
    const opponents = {};
    memberGames.forEach((g) => { opponents[g.opponent] = (opponents[g.opponent] || 0) + 1; });
    const topOpponent = Object.entries(opponents).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    html += `<div class="member-section">
  <div class="header-banner" style="background:#003278; border-left:6px solid ${member.accent_color};">
    <h1>${member.name}'s 2026 Rangers Schedule</h1>
    <p>${memberGames.length} Games at Globe Life Field</p>
  </div>`;

    for (const [month, monthGames] of Object.entries(months)) {
      html += `<div class="month-card">
    <div class="month-header" style="background:rgba(255,255,255,0.03);">
      <h3>⚾ ${month}</h3><span>${monthGames.length} Game${monthGames.length !== 1 ? "s" : ""}</span>
    </div>`;
      for (const g of monthGames) {
        const d = parseISO(g.date);
        const dateLabel = format(d, "EEE, MMM d");
        const isWeekend = ["Fri", "Sat", "Sun"].includes(g.day_of_week);
        const teamColor = getTeamColor(g.opponent);
        html += `<div class="game-row">
      <div class="date">${dateLabel}</div>
      <div class="opponent"><span class="team-dot" style="background:${teamColor}"></span>vs ${g.opponent}</div>
      <div class="time">${g.start_time}</div>
      <div>${isWeekend ? '<span class="wknd-tag">WKND</span>' : ""}</div>
    </div>`;
      }
      html += `</div>`;
    }

    html += `<div class="stats-row">
    <div class="stat-card"><div class="num">${memberGames.length}</div><div class="label">Total Games</div></div>
    <div class="stat-card"><div class="num">${weekendCount}</div><div class="label">Weekend</div></div>
    <div class="stat-card"><div class="num">${memberGames.length - weekendCount}</div><div class="label">Weekday</div></div>
    <div class="stat-card"><div class="num">${topOpponent}</div><div class="label">Top Opponent</div></div>
  </div>
</div>`;
  }

  html += `</div></body></html>`;
  return html;
}