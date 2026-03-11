import React, { useState } from "react";
import { formatGameDate } from "./utils";

export default function RawSubmissions({ submittedMembers, submissionMap, games }) {
  const [activeTab, setActiveTab] = useState(submittedMembers[0]?.name ? `raw-${submittedMembers[0].name}` : "");

  return (
    <div className="mb-5 rounded-2xl border border-white/[0.06] p-6" style={{ backgroundColor: "#1E293B" }}>
      <h4 className="mb-4 text-lg font-semibold text-[var(--gold)]" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
        Raw Submissions
      </h4>
      <div className="mb-4 flex flex-wrap gap-1">
        {submittedMembers.map((m) => (
          <button
            key={m.name}
            onClick={() => setActiveTab(`raw-${m.name}`)}
            className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${activeTab === `raw-${m.name}` ? "border border-[var(--navy)] bg-[var(--navy)] text-white" : "border border-white/[0.08] bg-transparent text-white/50 hover:text-white"}`}
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            {m.name}
          </button>
        ))}
      </div>
      {submittedMembers.map((m) => {
        if (activeTab !== `raw-${m.name}`) return null;
        const ranked = submissionMap[m.name]?.ranked_game_ids || [];
        return (
          <div key={m.name} className="thin-scrollbar max-h-[500px] overflow-y-auto rounded-lg">
            <table className="at">
              <thead><tr><th>Rank</th><th>Date</th><th>Opponent</th><th>Time</th></tr></thead>
              <tbody>
                {ranked.map((gid, idx) => {
                  const g = games.find((x) => x.game_number === gid);
                  if (!g) return null;
                  return (
                    <tr key={gid}>
                      <td className="font-semibold text-[var(--gold)]">{idx + 1}</td>
                      <td>{g.day_of_week}, {formatGameDate(g.date)}</td>
                      <td>{g.opponent}</td>
                      <td>{g.start_time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}