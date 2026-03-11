import React from "react";
import { RESERVED_GAME_NUMBER } from "./constants";
import { formatGameDate, sortGames, getTeamColor, getTeamAbbreviation } from "./utils";

function OwnerTag({ member }) {
  if (!member) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gold)]/20 bg-[var(--gold)]/8 px-2.5 py-1 text-[11px] font-bold text-[var(--gold)]">
        ⭐ Reserved
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
      style={{ backgroundColor: `${member.accent_color}CC` }}
    >
      {member.name}
    </span>
  );
}

export default function AdminResultsTable({ games, allocations, memberMap, activeTab }) {
  const allocationMap = Object.fromEntries(allocations.map((a) => [a.game_number, a]));

  const rows = sortGames(games).filter((game) =>
    activeTab === "master"
      ? true
      : allocationMap[game.game_number]?.assigned_to === activeTab
  );

  return (
    <div className="overflow-hidden rounded-xl border border-white/6 bg-[rgba(10,22,40,0.6)]">
      <div className="max-h-[560px] overflow-auto thin-scrollbar">
        <table className="data-table min-w-full text-left">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Day</th>
              <th>Time</th>
              <th>Opponent</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((game) => {
              const ownerAllocation = allocationMap[game.game_number];
              const ownerMember = ownerAllocation ? memberMap[ownerAllocation.assigned_to] : null;
              const teamColor = getTeamColor(game.opponent);
              return (
                <tr key={game.id} className="text-white/80">
                  <td className="text-white/40">{game.game_number}</td>
                  <td>{formatGameDate(game.date)}</td>
                  <td className="text-white/50">{game.day_of_week}</td>
                  <td>{game.start_time}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[8px] font-bold text-white oswald"
                        style={{ backgroundColor: teamColor }}
                      >
                        {getTeamAbbreviation(game.opponent).slice(0, 2)}
                      </div>
                      <span>{game.opponent}</span>
                    </div>
                  </td>
                  <td>
                    {game.game_number === RESERVED_GAME_NUMBER
                      ? <OwnerTag member={null} />
                      : <OwnerTag member={ownerMember} />
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}