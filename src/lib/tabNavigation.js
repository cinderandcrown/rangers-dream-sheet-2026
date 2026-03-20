export const TAB_CONFIG = {
  home: { path: "/" },
  myGames: { path: "/MyGames" },
};

export function getTabKeyForPath(pathname) {
  return pathname.startsWith("/MyGames") ? "myGames" : "home";
}

export function buildPath(locationLike) {
  if (!locationLike) return "";
  if (typeof locationLike === "string") return locationLike;
  return `${locationLike.pathname || ""}${locationLike.search || ""}${locationLike.hash || ""}`;
}