"use client";

import { useState } from "react";
import { TeamStanding } from "@/actions/stats";
import { renderRank, getPodiumRowStyle } from "@/lib/podium";
import { TeamDetailModal } from "@/components/TeamDetailModal";

interface StandingsTableProps {
  standings: TeamStanding[];
  emptyText?: string;
}

export function StandingsTable({
  standings,
  emptyText = "V tomto semestru zatím nebyly odehrány žádné zápasy.",
}: StandingsTableProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  if (standings.length === 0) {
    return (
      <p className="text-base-content/60 italic py-4 text-center text-xs">
        {emptyText}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="table table-sm sm:table-md w-full">
          <thead>
            <tr className="bg-base-200/50">
              <th className="w-10 sm:w-14 text-center px-1 sm:px-3">Poř.</th>
              <th className="px-2 sm:px-3">Tým</th>
              <th className="text-center px-1 sm:px-3">
                <span className="hidden sm:inline">Zápasy</span>
                <span className="sm:hidden">Z</span>
              </th>
              <th className="text-center px-1 sm:px-3">
                <span className="hidden sm:inline">Výhry</span>
                <span className="sm:hidden">V</span>
              </th>
              <th className="text-center px-1 sm:px-3">
                <span className="hidden sm:inline">Remízy</span>
                <span className="sm:hidden">R</span>
              </th>
              <th className="text-center px-1 sm:px-3">
                <span className="hidden sm:inline">Prohry</span>
                <span className="sm:hidden">P</span>
              </th>
              <th className="text-right px-2 sm:px-3">
                <span className="hidden sm:inline">Body</span>
                <span className="sm:hidden">B</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, idx) => (
              <tr key={t.teamId} className={getPodiumRowStyle(idx)}>
                <td className="w-10 sm:w-14 text-center px-1 sm:px-3 tabular-nums">
                  {renderRank(idx)}
                </td>
                <td className="px-2 sm:px-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(t.teamId)}
                    className="font-bold text-left hover:text-primary transition-colors underline-offset-2 hover:underline"
                    title="Zobrazit detail a soupisky týmu"
                  >
                    {t.teamName}
                  </button>
                </td>
                <td className="text-center px-1 sm:px-3 tabular-nums">{t.played}</td>
                <td className="text-center px-1 sm:px-3 text-success font-semibold tabular-nums">
                  {t.wins}
                </td>
                <td className="text-center px-1 sm:px-3 text-base-content/60 tabular-nums">
                  {t.draws}
                </td>
                <td className="text-center px-1 sm:px-3 text-error tabular-nums">
                  {t.losses}
                </td>
                <td className="text-right px-2 sm:px-3 font-black text-primary tabular-nums">
                  {t.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modální okno pro detail a soupisky týmu */}
      <TeamDetailModal
        teamId={selectedTeamId}
        isOpen={Boolean(selectedTeamId)}
        onOpenChange={(open) => !open && setSelectedTeamId(null)}
      />
    </>
  );
}
