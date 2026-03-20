import { parseISO, format } from "date-fns";
import { OUTLOOK_LOCATION } from "./constants";
import { base44 } from "@/api/base44Client";

function formatUtcIcsDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Convert "3:05 PM" Central Time to a real UTC Date.
 * Rangers season dates are during daylight time, so CT is UTC-5.
 */
function ctToUtcDate(dateStr, timeStr) {
  const d = parseISO(dateStr);
  const [timePart, suffix] = timeStr.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;

  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), hours + 5, minutes, 0));
}

function addHours(date, hoursToAdd) {
  return new Date(date.getTime() + hoursToAdd * 60 * 60 * 1000);
}

function escapeIcs(str) {
  return str.replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

function generateUid(gameNumber) {
  return `rangers-2026-game-${gameNumber}@dreamsheet`;
}

function buildEvent(game, memberName) {
  const dtStart = ctToUtcDate(game.date, game.start_time);
  const dtEnd = addHours(dtStart, 3.5);
  const summary = `${game.opponent} at Rangers`;
  const description = `Texas Rangers vs ${game.opponent}
Game #${game.game_number}
${memberName}'s Season Ticket`;
  const dtStamp = formatUtcIcsDate(new Date());

  return [
    "BEGIN:VEVENT",
    `UID:${generateUid(game.game_number)}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${formatUtcIcsDate(dtStart)}`,
    `DTEND:${formatUtcIcsDate(dtEnd)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(OUTLOOK_LOCATION)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  ].join("\r\n");
}

export function generateSingleGameIcs(game, memberName) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rangers Dream Sheet//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    buildEvent(game, memberName),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function generateAllGamesIcs(games, memberName) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rangers Dream Sheet//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(memberName)}'s Rangers 2026`,
    ...games.map((game) => buildEvent(game, memberName)),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/**
 * Upload ICS content as a hosted file and open it.
 * iPhone Safari does not reliably hand off website downloads straight into Calendar,
 * so the Apple flow should be treated as a file download/share step.
 */
export async function downloadIcsFile(icsContent, filename) {
  const safeFilename = filename || "event.ics";
  const blob = new Blob([icsContent], { type: "text/calendar" });
  const file = new File([blob], safeFilename, { type: "text/calendar" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });

  const link = document.createElement("a");
  link.href = file_url;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Generate a Google Calendar "Add Event" URL for a single game.
 */
export function generateGoogleCalUrl(game, memberName) {
  const dtStart = ctToUtcDatetime(game.date, game.start_time);
  const dtEnd = addHoursToUtc(dtStart, 3.5);
  const title = `${game.opponent} at Rangers`;
  const details = `Texas Rangers vs ${game.opponent}\nGame #${game.game_number}\n${memberName}'s Season Ticket`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dtStart}/${dtEnd}`,
    details: details,
    location: OUTLOOK_LOCATION,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook.com "Add Event" URL for a single game.
 */
export function generateOutlookCalUrl(game, memberName) {
  const d = parseISO(game.date);
  const [timePart, suffix] = game.start_time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;

  const startDt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes);
  const endDt = new Date(startDt.getTime() + 3.5 * 60 * 60 * 1000);

  const title = `${game.opponent} at Rangers`;
  const body = `Texas Rangers vs ${game.opponent}\nGame #${game.game_number}\n${memberName}'s Season Ticket`;
  const params = new URLSearchParams({
    rru: "addevent",
    subject: title,
    startdt: startDt.toISOString(),
    enddt: endDt.toISOString(),
    body: body,
    location: OUTLOOK_LOCATION,
    path: "/calendar/action/compose",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}