import { parseISO, format } from "date-fns";
import { OUTLOOK_LOCATION } from "./constants";

/**
 * Convert "3:05 PM" CT to an ICS-formatted datetime string in UTC.
 * Central Time is UTC-5 (CDT) during baseball season (Apr–Sep).
 */
function ctToUtcDatetime(dateStr, timeStr) {
  const d = parseISO(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const [timePart, suffix] = timeStr.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;

  // Add 5 hours for CDT → UTC
  hours += 5;
  let adjustedDay = Number(day);
  if (hours >= 24) {
    hours -= 24;
    adjustedDay += 1;
  }

  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const dd = String(adjustedDay).padStart(2, "0");
  return `${year}${month}${dd}T${h}${m}00Z`;
}

function addHoursToUtc(utcStr, hoursToAdd) {
  const year = parseInt(utcStr.slice(0, 4));
  const month = parseInt(utcStr.slice(4, 6)) - 1;
  const day = parseInt(utcStr.slice(6, 8));
  const hours = parseInt(utcStr.slice(9, 11));
  const minutes = parseInt(utcStr.slice(11, 13));
  const d = new Date(Date.UTC(year, month, day, hours, minutes));
  d.setUTCHours(d.getUTCHours() + hoursToAdd);
  return format(d, "yyyyMMdd") + "T" + format(d, "HHmmss") + "Z";
}

function escapeIcs(str) {
  return str.replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

function generateUid(gameNumber) {
  return `rangers-2026-game-${gameNumber}@dreamsheet`;
}

export function generateSingleGameIcs(game, memberName) {
  const dtStart = ctToUtcDatetime(game.date, game.start_time);
  const dtEnd = addHoursToUtc(dtStart, 3.5);
  const summary = `${game.opponent} at Rangers`;
  const description = `Texas Rangers vs ${game.opponent}\\nGame #${game.game_number}\\n${memberName}'s Season Ticket`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rangers Dream Sheet//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${generateUid(game.game_number)}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(OUTLOOK_LOCATION)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function generateAllGamesIcs(games, memberName) {
  const events = games.map((game) => {
    const dtStart = ctToUtcDatetime(game.date, game.start_time);
    const dtEnd = addHoursToUtc(dtStart, 3.5);
    const summary = `${game.opponent} at Rangers`;
    const description = `Texas Rangers vs ${game.opponent}\\nGame #${game.game_number}\\n${memberName}'s Season Ticket`;

    return [
      "BEGIN:VEVENT",
      `UID:${generateUid(game.game_number)}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcs(summary)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(OUTLOOK_LOCATION)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rangers Dream Sheet//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${memberName}'s Rangers 2026`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(icsContent, filename) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

  // Safari (especially iOS) blocks blob download links — use data URI + window.open fallback
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS || isSafari) {
    // Convert to data URI which Safari can handle
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      window.open(dataUrl, "_blank");
    };
    reader.readAsDataURL(blob);
  } else {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}