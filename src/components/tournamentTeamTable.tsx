"use server";
import { loadAllTeams } from "@/actions/teams";
import DeleteTeamButton from "@/components/deleteTeamButton";

interface TeamData {
  teamId: number;
  teamName: string | null;
  player1Id: number | null;
  player1Name: string | null;
  player2Id: number | null;
  player2Name: string | null;
}

export default async function TournamentTeamTable(id: { id: number }) {
  const rawTeamData = await loadAllTeams(id.id);
  const tournamentTeamData: TeamData[] = rawTeamData.map((item: any) => ({
    teamId: item.team.id,
    teamName: item.team.name,
    player1Id: item.team.player1_id,
    player1Name: item.player1?.name || null,
    player2Id: item.team.player2_id,
    player2Name: item.player2?.name || null,
  }));

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200 text-base-content">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-base-content/70 uppercase tracking-wider">
                Název týmu
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-base-content/70 uppercase tracking-wider">
                Hráč 1
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-base-content/70 uppercase tracking-wider">
                Hráč 2
              </th>
              <th className="px-6 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300">
            {tournamentTeamData.map((data: TeamData) => (
              <tr
                key={data.teamId}
                className="hover:bg-base-200/60 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-base-content">
                  {data.teamName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/80">
                  {data.player1Name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/80">
                  {data.player2Name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <DeleteTeamButton id={data.teamId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-right mt-3 text-xs font-semibold text-base-content/70">
        Celkem týmů: {tournamentTeamData.length}
      </div>
    </>
  );
}
