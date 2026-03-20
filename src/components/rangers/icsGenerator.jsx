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

/**
 * Trigger an .ics calendar import on iOS Safari and all browsers.
 *
 * iOS Safari cannot handle data: URIs or blob: URIs for text/calendar.
 * The only reliable method is navigating to a real HTTP URL that serves
 * the file with Content-Type: text/calendar.
 *
 * We submit a hidden form POST to our serveIcs backend function.
 * The server responds with Content-Type: text/calendar, which iOS
 * Safari intercepts to show the native "Add to Calendar" sheet.
 * Using a form POST avoids URL length limits for multi-game exports.
 */
export function downloadIcsFile(icsContent, filename) {
  const baseUrl = window.location.origin;
  const actionUrl = baseUrl + "/functions/serveIcs";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";

  // The backend reads JSON, but for a form submission to trigger
  // the browser's native file handling we need enctype handling.
  // Instead, use a GET with base64 for small payloads, POST form for large.
  const encoded = btoa(unescape(encodeURIComponent(icsContent)));
  const fullUrl = actionUrl + "?d=" + encodeURIComponent(encoded) + "&f=" + encodeURIComponent(filename || "event.ics");

  // If the URL is short enough (< 6000 chars), use simple navigation
  if (fullUrl.length < 6000) {
    window.location.href = fullUrl;
    return;
  }

  // For large payloads, open in a new window with a POST form
  const w = window.open("about:blank", "_blank");
  if (w) {
    w.document.write(
      `<html><body><form id="f" method="POST" action="${actionUrl}" enctype="application/x-www-form-urlencoded">` +
      `<input type="hidden" name="d" value="${encoded}">` +
      `<input type="hidden" name="f" value="${encodeURIComponent(filename || "event.ics")}">` +
      `</form><script>document.getElementById("f").submit();<\/script></body></html>`
    );
  }
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