import { getRoundById } from "@/actions/rounds";
import { getSeasonById } from "@/actions/seasons";
import { getMatchesForRound } from "@/actions/matches";
import {
  getRoundTeamStandings,
  getRoundPlayerLeaderboard,
  getPlayerScoresForMatch,
} from "@/actions/stats";
import { getTeamsForSeason, getTeamPlayersForRound } from "@/actions/teams";
import { RankBadge } from "@/components/RankBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  HelpCircle,
  LogIn,
  Swords,
  Target,
  Trophy,
  Users,
  Wind,
} from "lucide-react";
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
  ] = await Promise.all([
    getSeasonById(currentRound.seasonId),
    getMatchesForRound(roundId),
    getRoundTeamStandings(roundId),
    getRoundPlayerLeaderboard(roundId),
    getTeamsForSeason(currentRound.seasonId),
    getTeamPlayersForRound(roundId),
  ]);

  const matchesWithDetails = await Promise.all(
    matches.map(async (m) => ({
      ...m,
      playerScores: await getPlayerScoresForMatch(m.id),
    }))
  );

  return (
    <div className="min-h-screen px-3 py-6 sm:px-6 sm:py-10 md:p-12">
      {/* Veřejná horní lišta */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pb-6 mb-2 border-b border-base-300">
        <Link
          href="/public"
          className="btn btn-ghost font-black text-xl gap-2 text-base-content px-2"
        >
          🦊 SPPDF BeerPong
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content gap-1.5 hidden sm:inline-flex"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            O lize & Pravidla
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="btn btn-ghost btn-sm btn-square border border-base-300 text-base-content"
            title="Přihlášení správce"
          >
            <LogIn className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex flex-col gap-10">
        {/* Breadcrumb a hlavička */}
        <div className="flex flex-col gap-2">
          <Link
            href="/public"
            className="btn btn-ghost btn-xs gap-1 self-start text-base-content/70 hover:text-base-content"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Zpět na přehled semestru
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-base-content/60 font-semibold">
                  Semestr: {currentSeason?.name}
                </span>
                <span
                  className={`badge ${
                    currentRound.isCompleted ? "badge-success" : "badge-ghost"
                  } font-semibold whitespace-nowrap badge-xs`}
                >
                  {currentRound.isCompleted ? "Odehráno" : "Čeká se"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black">
                {currentRound.name}
              </h1>
              <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                {currentRound.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-base-content/50" />
                )}
                {currentRound.date
                  ? new Date(currentRound.date).toLocaleDateString("cs-CZ")
                  : "Termín večera nebyl upřesněn"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabulka večera a Králové kola */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tabulka večera */}
          <section className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-2">
            <div className="card-body p-6">
              <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-warning" />
                Pořadí večera ({currentRound.name})
              </h2>
              <p className="text-sm text-base-content/70 mb-4">
                Výsledky a body týmů získané v tomto konkrétním večeru
              </p>

              {teamStandings.length === 0 ? (
                <p className="text-base-content/60 italic py-6 text-center">
                  V tomto kole zatím nebyly zapsány žádné výsledky.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
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
                          className={idx === 0 ? "bg-warning/10 font-bold" : ""}
                        >
                          <td className="text-center">
                            <RankBadge rank={idx + 1} />
                          </td>
                          <td className="font-semibold text-base">{t.teamName}</td>
                          <td className="text-center tabular-nums">{t.played}</td>
                          <td className="text-center text-success tabular-nums">{t.wins}</td>
                          <td className="text-center text-base-content/60 tabular-nums">
                            {t.draws}
                          </td>
                          <td className="text-center text-error tabular-nums">{t.losses}</td>
                          <td className="text-center tabular-nums">
                            {t.cupsScored}:{t.cupsConceded}
                          </td>
                          <td className="text-right font-black text-lg text-primary tabular-nums">
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

          {/* Králové večera */}
          <section className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-6">
              <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-warning" />
                Králové večera
              </h2>
              <p className="text-sm text-base-content/70 mb-4">
                Nejlepší střelci a vyfukovači tohoto kola
              </p>

              {playerStats.length === 0 ? (
                <p className="text-base-content/60 italic py-6 text-center">
                  Žádné individuální statistiky.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full">
                    <thead>
                      <tr>
                        <th className="w-8 text-center">#</th>
                        <th>Hráč</th>
                        <th className="text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Target className="w-3 h-3 text-primary" />
                            Góly
                          </span>
                        </th>
                        <th className="text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Wind className="w-3 h-3 text-info" />
                            BJ
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.slice(0, 8).map((p, idx) => (
                        <tr
                          key={p.playerId}
                          className={idx === 0 ? "bg-warning/10 font-bold" : ""}
                        >
                          <td className="text-center">
                            <RankBadge rank={idx + 1} />
                          </td>
                          <td className="font-semibold">{p.playerName}</td>
                          <td className="text-center font-bold tabular-nums text-primary">
                            {p.totalScore}
                          </td>
                          <td className="text-center tabular-nums text-info">
                            {p.totalBlowjobs}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Zápasy večera */}
        <section className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="card-title text-2xl font-bold flex items-center gap-2">
                  <Swords className="w-6 h-6 text-primary" />
                  Odehraná utkání večera
                </h2>
                <p className="text-sm text-base-content/70">
                  Přehled výsledků jednotlivých zápasů a bodový příspěvek hráčů
                </p>
              </div>
              <span className="badge badge-neutral text-sm tabular-nums">
                {matchesWithDetails.length} zápasů
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {matchesWithDetails.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col bg-base-200/60 p-5 rounded-2xl border border-base-300 gap-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1 text-center sm:text-right font-bold text-lg">
                      {m.team1Name}
                    </div>
                    <div className="badge badge-lg font-black px-6 py-4 bg-base-100 text-xl border-base-300 shadow-inner tabular-nums">
                      {m.team1Score} : {m.team2Score}
                    </div>
                    <div className="flex-1 text-center sm:text-left font-bold text-lg">
                      {m.team2Name}
                    </div>
                  </div>

                  {m.playerScores && m.playerScores.length > 0 && (
                    <div className="border-t border-base-300/80 pt-3 flex flex-wrap justify-between gap-4 text-xs">
                      <div className="flex-1 flex flex-col gap-1 items-start sm:items-end">
                        <span className="font-bold text-base-content/60 uppercase">
                          {m.team1Name}:
                        </span>
                        {m.playerScores
                          .filter((ps) => ps.teamId === m.team1Id)
                          .map((ps) => (
                            <span
                              key={ps.id}
                              className="badge badge-ghost badge-sm gap-1 whitespace-nowrap"
                            >
                              <strong>{ps.playerName}</strong>: {ps.score}
                              <Target className="w-3 h-3 text-primary inline" />
                              {ps.blowjobs > 0 && (
                                <span className="flex items-center gap-0.5 ml-1 text-info">
                                  • {ps.blowjobs} <Wind className="w-3 h-3 inline" />
                                </span>
                              )}
                            </span>
                          ))}
                      </div>

                      <div className="flex-1 flex flex-col gap-1 items-start">
                        <span className="font-bold text-base-content/60 uppercase">
                          {m.team2Name}:
                        </span>
                        {m.playerScores
                          .filter((ps) => ps.teamId === m.team2Id)
                          .map((ps) => (
                            <span
                              key={ps.id}
                              className="badge badge-ghost badge-sm gap-1 whitespace-nowrap"
                            >
                              <strong>{ps.playerName}</strong>: {ps.score}
                              <Target className="w-3 h-3 text-primary inline" />
                              {ps.blowjobs > 0 && (
                                <span className="flex items-center gap-0.5 ml-1 text-info">
                                  • {ps.blowjobs} <Wind className="w-3 h-3 inline" />
                                </span>
                              )}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {matchesWithDetails.length === 0 && (
                <p className="text-base-content/60 italic py-6 text-center">
                  V tomto kole zatím neproběhly žádné zápasy.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Týmové soupisky pro toto kolo */}
        <section className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              Soupisky týmů pro tento turnajový večer
            </h2>
            <p className="text-sm text-base-content/70 mb-4">
              Rozdělení hráčů do týmů platné pro toto konkrétní kolo
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams.map((t) => {
                const teamMembers = roster.filter((r) => r.teamId === t.id);
                return (
                  <div
                    key={t.id}
                    className="card bg-base-200/70 border border-base-300 p-4 rounded-xl flex flex-col gap-2"
                  >
                    <h3 className="font-bold text-base flex justify-between items-center">
                      <span>{t.name}</span>
                      <span className="badge badge-sm badge-neutral tabular-nums font-semibold">
                        {teamMembers.length}
                      </span>
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                      {teamMembers.map((m) => (
                        <div
                          key={m.id}
                          className="bg-base-100 px-2.5 py-1.5 rounded text-xs font-medium"
                        >
                          {m.playerName}
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <span className="text-xs text-base-content/50 italic py-1">
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
