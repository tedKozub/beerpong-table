import { getRoundById, updateRound } from "@/actions/rounds";
import { getSeasonById } from "@/actions/seasons";
import {
  getMatchesForRound,
  deleteMatch,
} from "@/actions/matches";
import {
  getRoundTeamStandings,
  getRoundPlayerLeaderboard,
  getPlayerScoresForMatch,
} from "@/actions/stats";
import {
  getTeamsForSeason,
  assignPlayerToTeamInRound,
  removePlayerFromTeamInRound,
  getTeamPlayersForRound,
} from "@/actions/teams";
import { getPlayersForSeason } from "@/actions/players";
import { getScheduleForRound } from "@/actions/schedule";
import { ScheduleSection } from "@/components/ScheduleSection";
import { RoundSetup } from "@/components/RoundSetup";
import { CopyPublicLinkButton } from "@/components/CopyPublicLinkButton";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RoundDetailPage({
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
    players,
    roster,
    schedule,
  ] = await Promise.all([
    getSeasonById(currentRound.seasonId),
    getMatchesForRound(roundId),
    getRoundTeamStandings(roundId),
    getRoundPlayerLeaderboard(roundId),
    getTeamsForSeason(currentRound.seasonId),
    getPlayersForSeason(currentRound.seasonId),
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
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0 flex flex-col gap-6 sm:gap-8">
      {/* Hlavička & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-base-300 pb-4 sm:pb-5 w-full min-w-0">
        <div className="w-full sm:w-auto min-w-0">
          <div className="text-xs breadcrumbs mb-1 overflow-x-auto w-full max-w-full whitespace-nowrap">
            <ul>
              <li>
                <Link href="/">Domů</Link>
              </li>
              <li>
                <Link href="/seasons">Semestry</Link>
              </li>
              <li>
                <Link href={`/seasons/${currentRound.seasonId}`}>
                  {currentSeason?.name}
                </Link>
              </li>
              <li className="font-semibold">{currentRound.name}</li>
            </ul>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black break-words">
              {currentRound.name}
            </h1>
            <span
              className={`badge ${
                currentRound.isCompleted ? "badge-success" : "badge-ghost"
              } text-xs font-semibold whitespace-nowrap`}
            >
              {currentRound.isCompleted ? "Dokončeno" : "Plánováno"}
            </span>
          </div>
          <p className="text-base-content/70 text-xs mt-1">
            Semestr: <strong>{currentSeason?.name}</strong> • Večer #{currentRound.roundNumber}
            {currentRound.date &&
              ` • ${new Date(currentRound.date).toLocaleDateString("cs-CZ")}`}
          </p>
        </div>

        {/* Akce v hlavičce kola */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <CopyPublicLinkButton roundId={roundId} />
          <ExportCsvButton
            roundName={`${currentSeason?.name ?? "Turnaj"} - ${currentRound.name}`}
            standings={teamStandings}
            scoreLeaderboard={scoreLeaderboard}
            bjLeaderboard={bjLeaderboard}
          />

          {/* Přepínač stavu dokončení večera */}
          <form
            className="w-full sm:w-auto"
            action={async () => {
              "use server";
              await updateRound(currentRound.id, {
                isCompleted: !currentRound.isCompleted,
              });
            }}
          >
            <button
              type="submit"
              className={`btn btn-sm w-full sm:w-auto ${
                currentRound.isCompleted ? "btn-outline" : "btn-success"
              }`}
            >
              {currentRound.isCompleted
                ? "Znovu otevřít večer"
                : "Označit večer jako dohraný"}
            </button>
          </form>
        </div>
      </div>

      {/* Nastavení kola a aktivní týmy (když rozpis ještě není vygenerován) */}
      {schedule.length === 0 && (
        <RoundSetup
          roundId={roundId}
          seasonId={currentRound.seasonId}
          seasonTeams={teams}
          seasonPlayers={players}
          roster={roster}
          hasSchedule={false}
        />
      )}

      {/* Rozpis zápasů na stoly (Round-Robin z PR #40 + PDF & Prezentace) */}
      {schedule.length > 0 && (
        <ScheduleSection
          roundId={roundId}
          roundName={`${currentSeason?.name ?? "Turnaj"} - ${currentRound.name}`}
          schedule={schedule}
          roster={roster}
          allSeasonPlayers={players}
          isAdmin={true}
        />
      )}

      {/* Tabulka večera */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-3.5 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-0.5">
            Pořadí večera ({currentRound.name})
          </h2>
          <p className="text-xs text-base-content/70 mb-3 sm:mb-4">
            Výsledky a body získané v tomto kole
          </p>

          {teamStandings.length === 0 ? (
            <p className="text-base-content/60 italic py-6 text-center text-sm">
              V tomto kole zatím nebyly zapsány žádné výsledky.
            </p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table table-sm sm:table-md w-full">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-10 sm:w-12 text-center px-1 sm:px-3">Poř.</th>
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
                  {teamStandings.map((t, idx) => (
                    <tr
                      key={t.teamId}
                      className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                    >
                      <td className="text-center px-1 sm:px-3 tabular-nums font-semibold">
                        {idx + 1}.
                      </td>
                      <td className="font-semibold px-2 sm:px-3">{t.teamName}</td>
                      <td className="text-center px-1 sm:px-3 tabular-nums">{t.played}</td>
                      <td className="text-center px-1 sm:px-3 text-success tabular-nums font-semibold">
                        {t.wins}
                      </td>
                      <td className="text-center px-1 sm:px-3 text-base-content/60 tabular-nums">
                        {t.draws}
                      </td>
                      <td className="text-center px-1 sm:px-3 text-error tabular-nums">{t.losses}</td>
                      <td className="text-right px-2 sm:px-3 font-black text-primary tabular-nums">
                        {t.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Střelci a BlowJob King kola */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card bg-base-100 shadow-md border border-base-200 p-3.5 sm:p-5">
          <h3 className="font-bold text-base mb-2">Střelci kola</h3>
          {scoreLeaderboard.length === 0 ? (
            <p className="text-xs text-base-content/60 italic py-3 text-center">
              Žádné statistiky.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-10 text-center px-1 sm:px-2">#</th>
                    <th className="px-2">Hráč</th>
                    <th className="text-right px-2">Kelímky</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreLeaderboard.slice(0, 8).map((p, idx) => (
                    <tr
                      key={p.playerId}
                      className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                    >
                      <td className="text-center px-1 sm:px-2 tabular-nums">{idx + 1}.</td>
                      <td className="font-medium px-2">{p.playerName}</td>
                      <td className="text-right px-2 font-bold tabular-nums text-primary">
                        {p.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200 p-3.5 sm:p-5">
          <h3 className="font-bold text-base mb-2">BlowJob King kola</h3>
          {bjLeaderboard.length === 0 ? (
            <p className="text-xs text-base-content/60 italic py-3 text-center">
              Žádné statistiky.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-10 text-center px-1 sm:px-2">#</th>
                    <th className="px-2">Hráč</th>
                    <th className="text-right px-2">Vyfouknuto</th>
                  </tr>
                </thead>
                <tbody>
                  {bjLeaderboard.slice(0, 8).map((p, idx) => (
                    <tr
                      key={p.playerId}
                      className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                    >
                      <td className="text-center px-1 sm:px-2 tabular-nums">{idx + 1}.</td>
                      <td className="font-medium px-2">{p.playerName}</td>
                      <td className="text-right px-2 font-bold tabular-nums text-info">
                        {p.totalBlowjobs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Zápasy večera */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Odehraná utkání večera</h2>
            <span className="badge badge-neutral text-xs tabular-nums">
              {matchesWithDetails.length} zápasů
            </span>
          </div>

          <div className="flex flex-col gap-3">
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
                  <form
                    action={async () => {
                      "use server";
                      await deleteMatch(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      title="Smazat zápas"
                    >
                      Smazat
                    </button>
                  </form>
                </div>

                {m.playerScores && m.playerScores.length > 0 && (
                  <div className="border-t border-base-300/80 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs w-full min-w-0">
                    <div className="flex flex-col gap-1 items-start sm:items-end min-w-0">
                      <span className="font-bold text-base-content/60">
                        {m.team1Name}:
                      </span>
                      {m.playerScores
                        .filter((ps) => ps.teamId === m.team1Id)
                        .map((ps) => (
                          <span
                            key={ps.id}
                            className="badge badge-ghost badge-sm gap-1 whitespace-nowrap max-w-full truncate"
                          >
                            <strong>{ps.playerName}</strong>: {ps.score} trefeno
                            {ps.blowjobs > 0 && ` • ${ps.blowjobs} BJ`}
                          </span>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1 items-start min-w-0">
                      <span className="font-bold text-base-content/60">
                        {m.team2Name}:
                      </span>
                      {m.playerScores
                        .filter((ps) => ps.teamId === m.team2Id)
                        .map((ps) => (
                          <span
                            key={ps.id}
                            className="badge badge-ghost badge-sm gap-1 whitespace-nowrap max-w-full truncate"
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
                V tomto kole zatím neproběhl žádný zápas.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Nastavení kola a aktivní týmy (při vygenerovaném rozpisu přístupné v akordeonu) */}
      {schedule.length > 0 && (
        <details className="card bg-base-100 shadow-md border border-base-200">
          <summary className="card-body p-3.5 sm:p-5 cursor-pointer font-bold text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 select-none">
            <span>Nastavení kola a aktivní týmy</span>
            <span className="text-xs text-base-content/60 font-normal">
              Klikni pro správu týmů nebo přegenerování rozpisu
            </span>
          </summary>
          <div className="p-3.5 sm:p-6 pt-0">
            <RoundSetup
              roundId={roundId}
              seasonId={currentRound.seasonId}
              seasonTeams={teams}
              seasonPlayers={players}
              roster={roster}
              hasSchedule={true}
            />
          </div>
        </details>
      )}
    </div>
  );
}
