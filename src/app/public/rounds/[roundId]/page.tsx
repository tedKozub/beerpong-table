import { getRoundById } from "@/actions/rounds";
import { getSeasonById } from "@/actions/seasons";
import { getMatchesForRound } from "@/actions/matches";
import {
  getRoundTeamStandings,
  getRoundPlayerLeaderboard,
  getPlayerScoresForMatch,
} from "@/actions/stats";
import { getTeamsForSeason, getTeamPlayersForRound } from "@/actions/teams";
import { getScheduleForRound } from "@/actions/schedule";
import { ScheduleSection } from "@/components/ScheduleSection";
import { PublicNavbar } from "@/components/PublicNavbar";
import { CopyPublicLinkButton } from "@/components/CopyPublicLinkButton";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { StandingsTable } from "@/components/StandingsTable";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicRoundDetailPage({
  params,
}: {
  params: { roundId: string };
}) {
  const roundId = Number(params.roundId);
  if (isNaN(roundId)) return notFound();

  const currentRound = await getRoundById(roundId);
  if (!currentRound) return notFound();

  const [
    currentSeason,
    matches,
    teamStandings,
    playerStats,
    teams,
    roster,
    schedule,
  ] = await Promise.all([
    getSeasonById(currentRound.seasonId),
    getMatchesForRound(roundId),
    getRoundTeamStandings(roundId),
    getRoundPlayerLeaderboard(roundId),
    getTeamsForSeason(currentRound.seasonId),
    getTeamPlayersForRound(roundId),
    getScheduleForRound(roundId),
  ]);

  const matchesWithDetails = await Promise.all(
    matches.map(async (m) => ({
      ...m,
      playerScores: await getPlayerScoresForMatch(m.id),
    }))
  );

  const scoreLeaderboard = [...playerStats].sort(
    (a, b) => b.totalScore - a.totalScore
  );
  const bjLeaderboard = [...playerStats].sort(
    (a, b) => b.totalBlowjobs - a.totalBlowjobs
  );

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* Veřejná horní lišta */}
      <PublicNavbar currentRoundId={roundId} seasonName={currentSeason?.name} />

      <main className="max-w-7xl mx-auto w-full p-3 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8 min-w-0">
        {/* Breadcrumb a hlavička */}
        <div className="flex flex-col gap-1 w-full min-w-0">
          <Link
            href="/public"
            className="btn btn-ghost btn-xs self-start text-base-content/70 hover:text-base-content px-0"
          >
            ← Zpět na přehled semestru
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 w-full min-w-0">
            <div className="w-full sm:w-auto min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black break-words">
                {currentRound.name} • {currentSeason?.name}
              </h1>
              <p className="text-xs text-base-content/60 mt-0.5">
                {currentRound.date
                  ? new Date(currentRound.date).toLocaleDateString("cs-CZ")
                  : "Termín nebyl upřesněn"}{" "}
                • {currentRound.isCompleted ? "Odehráno" : "Plánováno"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <CopyPublicLinkButton roundId={roundId} />
              <ExportCsvButton
                roundName={`${currentSeason?.name ?? "Turnaj"} - ${currentRound.name}`}
                standings={teamStandings}
                scoreLeaderboard={scoreLeaderboard}
                bjLeaderboard={bjLeaderboard}
              />
            </div>
          </div>
        </div>

        {/* Rozpis stolů a generování PDF (PR #40) */}
        {schedule.length > 0 && (
          <ScheduleSection
            roundId={roundId}
            roundName={`${currentSeason?.name ?? "Turnaj"} - ${currentRound.name}`}
            schedule={schedule}
            isAdmin={false}
          />
        )}

        {/* Pořadí večera */}
        <section className="card bg-base-100 w-full shadow-lg border border-base-200">
          <div className="card-body p-3.5 sm:p-6">
            <h2 className="card-title text-base sm:text-xl justify-center mb-3">
              Pořadí večera ({currentRound.name})
            </h2>

            <StandingsTable
              standings={teamStandings}
              emptyText="V tomto kole zatím nebyly zapsány žádné výsledky."
            />
          </div>
        </section>

        {/* Dvě tabulky střelců večera vedle sebe */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <LeaderboardCard
            title="Střelci kola"
            subtitle="Trefené kelímky"
            players={scoreLeaderboard}
            type="score"
            previewLimit={5}
            emptyText="Žádná data."
            variant="public"
          />
          <LeaderboardCard
            title="BlowJob King kola"
            subtitle="Vyfouknuté kelímky"
            players={bjLeaderboard}
            type="blowjob"
            previewLimit={5}
            emptyText="Žádná data."
            variant="public"
          />
        </div>

        {/* Zápasy večera (sbalitelná sekce) */}
        <details className="collapse collapse-arrow bg-base-100 shadow-md border border-base-200" open>
          <summary className="collapse-title p-4 sm:p-6 cursor-pointer select-none font-bold text-lg flex items-center justify-between pr-12">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold inline">Odehraná utkání večera</h2>
              <span className="badge badge-neutral text-xs tabular-nums font-normal">
                {matchesWithDetails.length}{" "}
                {matchesWithDetails.length === 1
                  ? "zápas"
                  : matchesWithDetails.length >= 2 && matchesWithDetails.length <= 4
                  ? "zápasy"
                  : "zápasů"}
              </span>
            </div>
          </summary>

          <div className="collapse-content px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
            <div className="flex flex-col gap-3 pt-1">
              {matchesWithDetails.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col bg-base-200/50 p-4 rounded-xl border border-base-300 gap-2"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex-1 text-center sm:text-right font-bold text-base">
                      {m.team1Name}
                    </div>
                    <div className="badge badge-lg font-black px-4 py-3 bg-base-100 text-lg border-base-300 tabular-nums">
                      {m.team1Score} : {m.team2Score}
                    </div>
                    <div className="flex-1 text-center sm:text-left font-bold text-base">
                      {m.team2Name}
                    </div>
                  </div>

                  {m.playerScores && m.playerScores.length > 0 && (
                    <div className="border-t border-base-300/80 pt-2 flex flex-wrap justify-between gap-3 text-xs">
                      <div className="flex-1 flex flex-col gap-1 items-start sm:items-end">
                        <span className="font-bold text-base-content/60">
                          {m.team1Name}:
                        </span>
                        {m.playerScores
                          .filter((ps) => ps.teamId === m.team1Id)
                          .map((ps) => (
                            <span
                              key={ps.id}
                              className="badge badge-ghost badge-sm gap-1 whitespace-nowrap"
                            >
                              <strong>{ps.playerName}</strong>: {ps.score} trefeno
                              {ps.blowjobs > 0 && ` • ${ps.blowjobs} BJ`}
                            </span>
                          ))}
                      </div>

                      <div className="flex-1 flex flex-col gap-1 items-start">
                        <span className="font-bold text-base-content/60">
                          {m.team2Name}:
                        </span>
                        {m.playerScores
                          .filter((ps) => ps.teamId === m.team2Id)
                          .map((ps) => (
                            <span
                              key={ps.id}
                              className="badge badge-ghost badge-sm gap-1 whitespace-nowrap"
                            >
                              <strong>{ps.playerName}</strong>: {ps.score} trefeno
                              {ps.blowjobs > 0 && ` • ${ps.blowjobs} BJ`}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {matchesWithDetails.length === 0 && (
                <p className="text-base-content/60 italic py-4 text-center text-xs">
                  V tomto kole zatím neproběhly žádné zápasy.
                </p>
              )}
            </div>
          </div>
        </details>

        {/* Týmové soupisky pro toto kolo */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-1">
              Soupisky týmů pro tento večer
            </h2>
            <p className="text-xs text-base-content/60 mb-3">
              Rozdělení hráčů platné pro toto konkrétní kolo
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {teams.map((t) => {
                const teamMembers = roster.filter((r) => r.teamId === t.id);
                return (
                  <div
                    key={t.id}
                    className="bg-base-200/60 border border-base-300 p-3 rounded-lg flex flex-col gap-2"
                  >
                    <h3 className="font-bold text-sm flex justify-between items-center">
                      <span>{t.name}</span>
                      <span className="badge badge-sm badge-neutral tabular-nums font-semibold">
                        {teamMembers.length}
                      </span>
                    </h3>
                    <div className="flex flex-col gap-1 mt-0.5">
                      {teamMembers.map((m) => (
                        <div
                          key={m.id}
                          className="bg-base-100 px-2 py-1 rounded text-xs font-medium"
                        >
                          {m.playerName}
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <span className="text-xs text-base-content/50 italic py-0.5">
                          Žádní hráči nepřiřazeni.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
