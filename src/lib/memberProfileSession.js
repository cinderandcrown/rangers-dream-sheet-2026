const STORAGE_KEY = "rangers-member-profile";

export function getStoredMemberProfile() {
  if (typeof window === "undefined") return null;

  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed?.memberName || !parsed?.memberEmail) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMemberProfile(profile) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearStoredMemberProfile() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}