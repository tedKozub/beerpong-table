"use client";
import { deleteMatch } from "@/actions/matches";
import { MatchWithTeams } from "@/app/(admin)/[tournamentid]/action";

export interface MatchesOverViewTableProps {
  matches: MatchWithTeams[];
}

export const MatchesOverViewTable: React.FC<MatchesOverViewTableProps> = ({
  matches,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <table className="table table-zebra w-full">
        <thead className="bg-base-200 text-base-content">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-base-content/70 uppercase tracking-wider">
              Tým 1
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold text-base-content/70 uppercase tracking-wider">
              Skóre
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-base-content/70 uppercase tracking-wider">
              Tým 2
            </th>
            <th className="px-6 py-4 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-base-300">
          {matches.map((match) => (
            <tr
              key={match.match.id}
              className="hover:bg-base-200/60 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-base-content">
                {match.team1?.name || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-success font-black">
                {match.match.score || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-base-content">
                {match.team2?.name || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  onClick={() => deleteMatch(match.match.id)}
                  className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/20 transition-colors"
                  title="Smazat zápas"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18.364 5.636a1 1 0 010 1.414L13.414 12l4.95 4.95a1 1 0 11-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 01-1.414-1.414L10.586 12 5.636 7.05a1 1 0 111.414-1.414L12 10.586l4.95-4.95a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
