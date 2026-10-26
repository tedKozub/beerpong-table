import { getRoundById, updateRound } from "@/actions/rounds";
import { getSeasonById } from "@/actions/seasons";
import {
  getMatchesForRound,
  createMatch,
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Hlavička & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-300 pb-5">
        <div>
          <div className="text-xs breadcrumbs mb-1">
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black">
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

        {/* Přepínač stavu dokončení večera */}
        <form
          action={async () => {
            "use server";
            await updateRound(currentRound.id, {
              isCompleted: !currentRound.isCompleted,
            });
          }}
        >
          <button
            type="submit"
            className={`btn btn-sm ${
              currentRound.isCompleted ? "btn-outline" : "btn-success"
            }`}
          >
            {currentRound.isCompleted
              ? "Znovu otevřít večer"
              : "Označit večer jako dohraný"}
          </button>
        </form>
      </div>

      {/* Rozpis zápasů na stoly (Round-Robin z PR #40 + PDF & Prezentace) */}
      <ScheduleSection
        roundId={roundId}
        roundName={`${currentSeason?.name ?? "Turnaj"} - ${currentRound.name}`}
        schedule={schedule}
        isAdmin={true}
      />

      {/* Tabulka večera */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-1">
            Pořadí večera ({currentRound.name})
          </h2>
          <p className="text-xs text-base-content/70 mb-4">
            Výsledky a body získané v tomto kole
          </p>

          {teamStandings.length === 0 ? (
            <p className="text-base-content/60 italic py-6 text-center text-sm">
              V tomto kole zatím nebyly zapsány žádné výsledky.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm sm:table-md w-full">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-12 text-center">Poř.</th>
                    <th>Tým</th>
                    <th className="text-center">Z</th>
                    <th className="text-center">V</th>
                    <th className="text-center">R</th>
                    <th className="text-center">P</th>
                    <th className="text-center">Skóre</th>
                    <th className="text-right">Body</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStandings.map((t, idx) => (
                    <tr
                      key={t.teamId}
                      className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                    >
                      <td className="text-center tabular-nums font-semibold">
                        {idx + 1}.
                      </td>
                      <td className="font-semibold">{t.teamName}</td>
                      <td className="text-center tabular-nums">{t.played}</td>
                      <td className="text-center text-success tabular-nums">{t.wins}</td>
                      <td className="text-center text-base-content/60 tabular-nums">
                        {t.draws}
                      </td>
                      <td className="text-center text-error tabular-nums">{t.losses}</td>
                      <td className="text-center tabular-nums">
                        {t.cupsScored}:{t.cupsConceded}
                      </td>
                      <td className="text-right font-black text-primary tabular-nums">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-md border border-base-200 p-4 sm:p-5">
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
                    <th className="w-10 text-center">#</th>
                    <th>Hráč</th>
                    <th className="text-right">Kelímky</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreLeaderboard.slice(0, 8).map((p, idx) => (
                    <tr
                      key={p.playerId}
                      className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                    >
                      <td className="text-center tabular-nums">{idx + 1}.</td>
                      <td className="font-medium">{p.playerName}</td>
                      <td className="text-right font-bold tabular-nums text-primary">
                        {p.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200 p-4 sm:p-5">
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
                    <th className="w-10 text-center">#</th>
                    <th>Hráč</th>
                    <th className="text-right">Vyfouknuto</th>
                  </tr>
                </thead>
                <tbody>
                  {bjLeaderboard.slice(0, 8).map((p, idx) => (
                    <tr
                      key={p.playerId}
                      className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                    >
                      <td className="text-center tabular-nums">{idx + 1}.</td>
                      <td className="font-medium">{p.playerName}</td>
                      <td className="text-right font-bold tabular-nums text-info">
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
                V tomto kole zatím neproběhl žádný zápas.
              </p>
            )}
          </div>

          {/* Formulář pro zápis nového zápasu večera */}
          {teams.length >= 2 && (
            <div className="mt-6 pt-4 border-t border-base-300">
              <h3 className="font-bold text-base mb-3">Zapsat výsledek zápasu</h3>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const team1Id = Number(formData.get("team1Id"));
                  const team2Id = Number(formData.get("team2Id"));
                  const team1Score = Number(formData.get("team1Score"));
                  const team2Score = Number(formData.get("team2Score"));

                  if (team1Id && team2Id && team1Id !== team2Id) {
                    const playerScoresData: {
                      playerId: number;
                      teamId: number;
                      score: number;
                      blowjobs: number;
                    }[] = [];

                    for (const p of players) {
                      const scoreVal = formData.get(`p_score_${p.id}`);
                      const bjVal = formData.get(`p_bj_${p.id}`);
                      const teamVal = formData.get(`p_team_${p.id}`);

                      if (scoreVal !== null || bjVal !== null) {
                        const score = Number(scoreVal) || 0;
                        const bj = Number(bjVal) || 0;
                        const assignedTeamId = Number(teamVal);

                        if (
                          (score > 0 || bj > 0) &&
                          (assignedTeamId === team1Id || assignedTeamId === team2Id)
                        ) {
                          playerScoresData.push({
                            playerId: p.id,
                            teamId: assignedTeamId,
                            score,
                            blowjobs: bj,
                          });
                        }
                      }
                    }

                    await createMatch({
                      roundId,
                      team1Id,
                      team2Id,
                      team1Score: isNaN(team1Score) ? 0 : team1Score,
                      team2Score: isNaN(team2Score) ? 0 : team2Score,
                      status: "completed",
                      playerScores:
                        playerScoresData.length > 0 ? playerScoresData : undefined,
                    });
                  }
                }}
                className="flex flex-col gap-3 bg-base-200/50 p-4 rounded-xl border border-base-300"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <label className="label label-text font-semibold text-xs">
                      Tým 1
                    </label>
                    <select
                      name="team1Id"
                      className="select select-bordered select-sm w-full"
                      required
                    >
                      <option value="">Vyber tým 1</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-16">
                    <label className="label label-text font-semibold text-xs text-center">
                      Skóre 1
                    </label>
                    <input
                      name="team1Score"
                      type="number"
                      min="0"
                      className="input input-bordered input-sm w-full text-center font-bold tabular-nums"
                      defaultValue="10"
                      required
                    />
                  </div>

                  <div className="text-lg font-bold self-end pb-1.5">:</div>

                  <div className="w-16">
                    <label className="label label-text font-semibold text-xs text-center">
                      Skóre 2
                    </label>
                    <input
                      name="team2Score"
                      type="number"
                      min="0"
                      className="input input-bordered input-sm w-full text-center font-bold tabular-nums"
                      defaultValue="7"
                      required
                    />
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="label label-text font-semibold text-xs">
                      Tým 2
                    </label>
                    <select
                      name="team2Id"
                      className="select select-bordered select-sm w-full"
                      required
                    >
                      <option value="">Vyber tým 2</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {players.length > 0 && (
                  <details className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-lg text-xs">
                    <summary className="collapse-title font-semibold text-xs">
                      Zadat individuální statistiky hráčů (kelímky a blowjoby)
                    </summary>
                    <div className="collapse-content flex flex-col gap-2 pt-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                        {players.map((p) => {
                          const defaultTeam = roster.find(
                            (r) => r.playerId === p.id
                          )?.teamId;

                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded bg-base-200 text-xs"
                            >
                              <span className="font-medium truncate max-w-[110px]">
                                {p.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <select
                                  name={`p_team_${p.id}`}
                                  className="select select-bordered select-xs"
                                  defaultValue={defaultTeam ?? ""}
                                >
                                  <option value="">Nevybrán</option>
                                  {teams.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  name={`p_score_${p.id}`}
                                  type="number"
                                  placeholder="Góly"
                                  min="0"
                                  className="input input-bordered input-xs w-14 tabular-nums"
                                />
                                <input
                                  name={`p_bj_${p.id}`}
                                  type="number"
                                  placeholder="BJ"
                                  min="0"
                                  className="input input-bordered input-xs w-12 tabular-nums"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                )}

                <div className="flex justify-end mt-2">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Uložit výsledek zápasu
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Soupisky pro tento turnajový večer (dynamické týmy) */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold">Soupisky týmů pro tento večer</h2>
            <span className="text-xs text-base-content/60">
              Hráči mohou v jednotlivých kolech nastupovat za různé týmy
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
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
                        className="flex justify-between items-center bg-base-100 px-2 py-1 rounded text-xs"
                      >
                        <span>{m.playerName}</span>
                        <form
                          action={async () => {
                            "use server";
                            await removePlayerFromTeamInRound(roundId, m.playerId);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-error hover:font-bold px-1"
                            title="Odebrat z týmu pro toto kolo"
                          >
                            ×
                          </button>
                        </form>
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

          {/* Rychlé přiřazení hráče na dnešní večer */}
          {players.length > 0 && teams.length > 0 && (
            <form
              action={async (formData: FormData) => {
                "use server";
                const playerId = Number(formData.get("playerId"));
                const teamId = Number(formData.get("teamId"));
                if (playerId && teamId) {
                  await assignPlayerToTeamInRound(roundId, teamId, playerId);
                }
              }}
              className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-base-300 text-xs"
            >
              <span className="font-semibold text-base-content/70">
                Přiřadit hráče na tento večer:
              </span>
              <select
                name="playerId"
                className="select select-bordered select-xs"
                required
              >
                <option value="">Vyber hráče...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <span>hraje za</span>
              <select
                name="teamId"
                className="select select-bordered select-xs"
                required
              >
                <option value="">Vyber tým...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-xs">
                Přiřadit
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
