import { getSeasonById, setActiveSeason } from "@/actions/seasons";
import { getRoundsForSeason, createRound } from "@/actions/rounds";
import { getTeamsForSeason, createTeam, deleteTeam } from "@/actions/teams";
import {
  getPlayersForSeason,
  createPlayer,
  deletePlayer,
} from "@/actions/players";
import {
  getSeasonPlayerLeaderboard,
  getSeasonTeamStandings,
} from "@/actions/stats";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeasonCrudManager } from "@/components/SeasonCrudManager";
import { StandingsTable } from "@/components/StandingsTable";

export default async function SeasonDetailPage({
  params,
}: {
  params: { seasonId: string };
}) {
  const seasonId = Number(params.seasonId);
  if (isNaN(seasonId)) return notFound();

  const currentSeason = await getSeasonById(seasonId);
  if (!currentSeason) return notFound();

  const [rounds, teams, players, playerStats, teamStandings] =
    await Promise.all([
      getRoundsForSeason(seasonId),
      getTeamsForSeason(seasonId),
      getPlayersForSeason(seasonId),
      getSeasonPlayerLeaderboard(seasonId),
      getSeasonTeamStandings(seasonId),
    ]);

  const scoreLeaderboard = [...playerStats].sort(
    (a, b) => b.totalScore - a.totalScore
  );
  const bjLeaderboard = [...playerStats].sort(
    (a, b) => b.totalBlowjobs - a.totalBlowjobs
  );

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Hlavička & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-base-300 pb-4 sm:pb-5">
        <div>
          <div className="text-xs breadcrumbs mb-1 overflow-x-auto whitespace-nowrap">
            <ul>
              <li>
                <Link href="/">Domů</Link>
              </li>
              <li>
                <Link href="/seasons">Semestry</Link>
              </li>
              <li className="font-semibold">{currentSeason.name}</li>
            </ul>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-black">
              {currentSeason.name}
            </h1>
            <span
              className={`badge ${
                currentSeason.isActive
                  ? "badge-success text-success-content font-bold gap-1.5"
                  : "badge-neutral text-neutral-content font-medium"
              } whitespace-nowrap text-xs`}
            >
              {currentSeason.isActive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              )}
              {currentSeason.isActive ? "Aktivní semestr" : "Archiv"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!currentSeason.isActive && (
            <form
              action={async () => {
                "use server";
                await setActiveSeason(seasonId);
              }}
            >
              <button
                type="submit"
                className="btn btn-outline btn-success btn-sm text-xs"
              >
                Nastavit jako aktivní semestr
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Přehledové statistiky */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm p-3.5 sm:p-4">
          <h2 className="text-xs text-base-content/60 font-semibold">
            Turnajové večery (Kola)
          </h2>
          <p className="text-2xl sm:text-3xl font-black mt-1 tabular-nums text-primary">
            {rounds.length}
          </p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-sm p-3.5 sm:p-4">
          <h2 className="text-xs text-base-content/60 font-semibold">
            Týmy v semestru
          </h2>
          <p className="text-2xl sm:text-3xl font-black mt-1 tabular-nums text-secondary">
            {teams.length}
          </p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-sm p-3.5 sm:p-4">
          <h2 className="text-xs text-base-content/60 font-semibold">
            Registrovaní hráči
          </h2>
          <p className="text-2xl sm:text-3xl font-black mt-1 tabular-nums text-accent">
            {players.length}
          </p>
        </div>
      </div>



      {/* Ligová tabulka a střelci */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-3.5 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-1">Průběžná tabulka semestru</h2>
          <StandingsTable
            standings={teamStandings}
            emptyText="V tomto semestru zatím nebyly odehrány žádné zápasy."
          />
        </div>
      </section>

      {/* Správa kol, týmů a hráčů s plným CRUD, přejmenováním, dialogy a ochranou proti duplicitám */}
      <SeasonCrudManager
        seasonId={seasonId}
        initialTeams={teams}
        initialPlayers={players}
        initialRounds={rounds}
      />
    </div>
  );
}
