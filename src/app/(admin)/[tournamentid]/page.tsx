"use server";
import { getScheduleWithResults } from "@/actions/schedule";
import { getTeamsForTournament } from "@/actions/teams";
import AddNewMatchButton from "@/components/addNewMatchButton";
import CreateTeam from "@/components/createTeam";
import { MatchesOverViewTable } from "@/components/matchesOverviewTable";
import { ScheduleGenerateForm } from "@/components/scheduleGenerateForm";
import { ScheduleMain } from "@/components/scheduleMain";
import StatsTournamentButton from "@/components/statsTournamentButton";
import SharePublicLink from "@/components/SharePublicLink";
import TournamentTeamTable from "@/components/tournamentTeamTable";
import { pluralCs } from "@/lib/utils";
import { loadMatches, loadTournament, MatchWithTeams } from "./action";

export default async function Home(params: {
  params: { tournamentid: number };
}) {
  const tournamentId = Number(params.params.tournamentid);
  if (isNaN(tournamentId)) {
    return <div className="p-8 text-center text-error">Neplatné ID turnaje</div>;
  }

  const [tournament, teams, matches, schedule] = await Promise.all([
    loadTournament(tournamentId),
    getTeamsForTournament(tournamentId),
    loadMatches(tournamentId) as Promise<MatchWithTeams[] | null>,
    getScheduleWithResults(tournamentId),
  ]);

  if (!tournament?.id) {
    return <div className="p-8 text-center text-error">Turnaj nebyl nalezen</div>;
  }

  const playedMatches = matches && (
    <div className="card bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-base-content">Odehrané zápasy</h2>
      <MatchesOverViewTable matches={matches} />
    </div>
  );

  // once generated, the schedule is the main page of the tournament
  if (schedule.length > 0) {
    const scheduledTeamIds = new Set(
      schedule.flatMap((m) => [m.team1Id, m.team2Id])
    );
    const isOutdated =
      teams.length !== scheduledTeamIds.size ||
      teams.some((t) => !scheduledTeamIds.has(t.id));

    return (
      <ScheduleMain
        tournamentId={tournamentId}
        tournamentName={tournament.name ?? ""}
        isOutdated={isOutdated}
        schedule={schedule}
      >
        {playedMatches}
      </ScheduleMain>
    );
  }

  // setup: teams with players, then the number of tables and the schedule
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="border-b border-base-300 bg-base-100/50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-base-content">{tournament.name}</h1>
            <p className="text-base-content/70 mt-1 text-sm font-medium">
              Nastavení turnaje · {pluralCs(teams.length, "tým", "týmy", "týmů")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SharePublicLink tournamentId={tournamentId} />
            <StatsTournamentButton id={tournamentId} />
            <AddNewMatchButton
              id={tournamentId}
              matches={matches || undefined}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
            <CreateTeam id={tournamentId} />
          </div>
          <div className="card bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-base-content">Týmy v turnaji</h2>
            <TournamentTeamTable id={tournamentId} />
          </div>
        </div>

        <div className="card bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-base-content">Rozpis zápasů</h2>
          <p className="text-base-content/70 mb-4 text-sm">
            {teams.length < 2
              ? "Přidej alespoň 2 týmy, pak zadej počet stolů a vygeneruj rozpis."
              : "Zadej počet stolů a vygeneruj rozpis. Rozpis se pak stane hlavní stránkou turnaje."}
          </p>
          <ScheduleGenerateForm
            tournamentId={tournamentId}
            defaultTables={1}
            hasSchedule={false}
            disabled={teams.length < 2}
          />
        </div>

        {playedMatches && (
          <>
            <div className="flex justify-end space-x-4">
              <SharePublicLink tournamentId={tournamentId} />
              <StatsTournamentButton id={tournamentId} />
              <AddNewMatchButton id={tournamentId} matches={matches!} />
            </div>
            {playedMatches}
          </>
        )}
      </div>
    </div>
  );
}
