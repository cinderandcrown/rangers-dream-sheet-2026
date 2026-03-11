import { format, parseISO } from "date-fns";
import { MEMBER_SEED_DATA, TEAM_ABBREVIATIONS, TEAM_COLORS } from "./constants";

export function sortGames(games = []) {
  return [...games].sort((a, b) => a.game_number - b.game_number);
}

export function sortMembers(members = []) {
  const order = MEMBER_SEED_DATA.map((member) => member.name);
  return [...members].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
}

export function getTeamColor(opponent) {
  return TEAM_COLORS[opponent] || "#475569";
}

export function getTeamAbbreviation(opponent) {
  return TEAM_ABBREVIATIONS[opponent] || opponent.slice(0, 3).toUpperCase();
}

export function formatGameDate(date) {
  return format(parseISO(date), "MMM d, yyyy");
}

export function formatGameMeta(game) {
  return `${game.day_of_week} · ${format(parseISO(game.date), "MMM d")} · ${game.start_time}`;
}

export function formatOutlookDate(date) {
  return format(parseISO(date), "MM/dd/yyyy");
}

export function timeToMinutes(value) {
  const [time, suffix] = value.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function addHoursToTime(value, hoursToAdd) {
  return minutesToTime(timeToMinutes(value) + Math.round(hoursToAdd * 60));
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}