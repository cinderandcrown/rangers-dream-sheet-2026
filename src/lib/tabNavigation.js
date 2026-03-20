export const TAB_CONFIG = {
  home: { path: "/" },
  myGames: { path: "/MyGames" },
  profile: { path: "/Profile" },
};

export function getTabKeyForPath(pathname) {
  if (pathname.startsWith("/MyGames")) return "myGames";
  if (pathname.startsWith("/Profile")) return "profile";
  return "home";
}

export function buildPath(locationLike) {
  if (!locationLike) return "";
  if (typeof locationLike === "string") return locationLike;
  return `${locationLike.pathname || ""}${locationLike.search || ""}${locationLike.hash || ""}`;
}