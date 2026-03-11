// MLB team logo URLs from mlbstatic.com using official team IDs
// Format: https://www.mlbstatic.com/team-logos/{teamId}.svg

const TEAM_IDS = {
  Reds: 113,
  Mariners: 136,
  Pirates: 134,
  Athletics: 133,
  Yankees: 147,
  Cubs: 112,
  "D-backs": 109,
  Astros: 117,
  Royals: 118,
  Guardians: 114,
  Twins: 142,
  Padres: 135,
  Tigers: 116,
  Angels: 108,
  "White Sox": 145,
  Giants: 137,
  Orioles: 110,
  Nationals: 120,
  Rays: 139,
  "Red Sox": 111,
  "Blue Jays": 141,
  Mets: 121,
  Rangers: 140,
};

export function getTeamLogoUrl(opponent) {
  const id = TEAM_IDS[opponent];
  if (!id) return null;
  return `https://www.mlbstatic.com/team-logos/${id}.svg`;
}