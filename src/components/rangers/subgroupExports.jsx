import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";

function applyHeaderStyle(ws, colCount) {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
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

function applyDataStyles(ws, rowCount, colCount) {
  for (let r = 1; r <= rowCount; r++) {
    const fill = r % 2 === 0 ? { fgColor: { rgb: "F8FAFC" } } : undefined;
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { name: "Arial", sz: 10, color: { rgb: "1E293B" } },
        fill,
        border: {
          top: { style: "thin", color: { rgb: "E2E8F0" } },
          bottom: { style: "thin", color: { rgb: "E2E8F0" } },
          left: { style: "thin", color: { rgb: "E2E8F0" } },
          right: { style: "thin", color: { rgb: "E2E8F0" } },
        },
        alignment: { vertical: "center" },
      };
    }
  }
}

export function downloadSubgroupExcel(managerName, games, picks) {
  const rows = games
    .map((game) => {
      const pick = picks.find((item) => item.game_number === game.game_number);
      return {
        "Pick #": pick?.pick_order || "",
        "Subgroup Member": pick?.subgroup_member_name || "Unassigned",
        "Game #": game.game_number,
        Date: format(parseISO(game.date), "EEEE, MMMM d, yyyy"),
        Day: game.day_of_week,
        "Time (CT)": game.start_time,
        Opponent: game.opponent,
        Manager: managerName,
      };
    })
    .sort((a, b) => Number(a["Game #"]) - Number(b["Game #"]));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 10 },
    { wch: 22 },
    { wch: 10 },
    { wch: 26 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
  ];
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  ws["!autofilter"] = { ref: `A1:H${rows.length + 1}` };

  applyHeaderStyle(ws, 8);
  applyDataStyles(ws, rows.length, 8);

  XLSX.utils.book_append_sheet(wb, ws, `${managerName} Subgroup`);
  XLSX.writeFile(wb, `${managerName}-Subgroup-Draft-2026.xlsx`);
}