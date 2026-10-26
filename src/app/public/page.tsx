import { getActiveSeason, getAllSeasons } from "@/actions/seasons";
import { getRoundsForSeason } from "@/actions/rounds";
import {
  getSeasonPlayerLeaderboard,
  getSeasonTeamStandings,
} from "@/actions/stats";
import { RankBadge } from "@/components/RankBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  HelpCircle,
  LogIn,
  Target,
  Trophy,
  Wind,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PublicOverviewPage() {
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return (
      <div className="min-h-screen px-4 py-12 max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold mb-4">🦊 SPPDF BeerPong Liga</h1>
        <p className="text-base-content/70 text-lg mb-8">
          V současné chvíli není vyhlášena žádná aktivní sezóna semestru.
        </p>
        <Link href="/about" className="btn btn-outline gap-1.5">
          <HelpCircle className="w-4 h-4" />
          O lize & Pravidla
        </Link>
      </div>
    );
  }

  const [rounds, teamStandings, playerLeaderboard] = await Promise.all([
    getRoundsForSeason(activeSeason.id),
    getSeasonTeamStandings(activeSeason.id),
    getSeasonPlayerLeaderboard(activeSeason.id),
  ]);

  const topScorer = playerLeaderboard[0];
  const bjKing = [...playerLeaderboard].sort(
    (a, b) => b.totalBlowjobs - a.totalBlowjobs
  )[0];

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
        {/* Titulek a status aktivního semestru */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success gap-1.5 font-semibold whitespace-nowrap">
                <span className="inline-block w-2 h-2 rounded-full bg-current opacity-80" />
                Aktivní semestr
              </span>
              <span className="text-xs text-base-content/60 font-semibold tabular-nums">
                {rounds.length} kol
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              {activeSeason.name}
            </h1>
            <p className="text-base-content/70 text-sm sm:text-base mt-1">
              Oficiální výsledky turnajových večerů a statistiky BeerPong ligy
            </p>
          </div>
        </div>

        {/* Králové semestru (dvě karty vedle sebe se stejnou šířkou a paddingem) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Král střelců */}
          <div className="card bg-base-100 border border-warning/30 shadow-md">
            <div className="card-body p-6 flex flex-row items-center justify-between">
              <div>
                <div className="text-xs text-warning-content font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-warning" />
                  Historický Král střelců semestru
                </div>
                <div className="text-2xl font-black mt-1">
                  {topScorer?.playerName ?? "Zatím nikdo"}
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                  Zápasů: <span className="tabular-nums font-semibold">{topScorer?.matchesPlayed ?? 0}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-black text-warning tabular-nums">
                  {topScorer?.totalScore ?? 0}
                </div>
                <div className="text-xs text-base-content/60 font-medium">
                  trefených kelímků
                </div>
              </div>
            </div>
          </div>

          {/* BlowJob King */}
          <div className="card bg-base-100 border border-info/30 shadow-md">
            <div className="card-body p-6 flex flex-row items-center justify-between">
              <div>
                <div className="text-xs text-info-content font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Wind className="w-4 h-4 text-info" />
                  Historický BlowJob King semestru
                </div>
                <div className="text-2xl font-black mt-1">
                  {bjKing?.playerName ?? "Zatím nikdo"}
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                  Zápasů: <span className="tabular-nums font-semibold">{bjKing?.matchesPlayed ?? 0}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-black text-info tabular-nums">
                  {bjKing?.totalBlowjobs ?? 0}
                </div>
                <div className="text-xs text-base-content/60 font-medium">
                  vyfouknutých kelímků
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Turnajové večery (Kola 1 až 5) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Turnajové večery (Kola)
            </h2>
            <span className="text-xs text-base-content/60 font-semibold tabular-nums">
              {rounds.filter((r) => r.isCompleted).length} / {rounds.length} odehráno
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {rounds.map((r) => (
              <div
                key={r.id}
                className={`card border shadow-sm transition-all hover:shadow-md ${
                  r.isCompleted
                    ? "bg-base-100 border-base-300"
                    : "bg-base-200/50 border-dashed border-base-300"
                }`}
              >
                <div className="card-body p-4 flex flex-col justify-between h-44">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-semibold text-base-content/60">
                        Večer #{r.roundNumber}
                      </span>
                      <span
                        className={`badge badge-xs whitespace-nowrap ${
                          r.isCompleted ? "badge-success" : "badge-ghost"
                        }`}
                      >
                        {r.isCompleted ? "Odehráno" : "Čeká se"}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base mt-1 line-clamp-1">
                      {r.name}
                    </h3>
                    <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                      {r.isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 text-success" />
                      ) : (
                        <Clock className="w-3 h-3 text-base-content/50" />
                      )}
                      {r.date
                        ? new Date(r.date).toLocaleDateString("cs-CZ")
                        : "Termín neurčen"}
                    </p>
                  </div>

                  <Link
                    href={`/public/rounds/${r.id}`}
                    className="btn btn-sm btn-outline btn-block mt-2"
                  >
                    Výsledky kola →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabulka a střelci */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Celkové pořadí týmů */}
          <section className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-2">
            <div className="card-body p-6">
              <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-warning" />
                Celkové týmové pořadí
              </h2>
              <p className="text-sm text-base-content/70 mb-4">
                Průběžná ligová tabulka týmů v aktuálním semestru
              </p>

              {teamStandings.length === 0 ? (
                <p className="text-base-content/60 italic py-8 text-center">
                  Zatím nebyly zaznamenány žádné výsledky zápasů.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th className="w-12 text-center">Poř.</th>
                        <th>Tým</th>
                        <th className="text-center">Zápasy</th>
                        <th className="text-center">V</th>
                        <th className="text-center">R</th>
                        <th className="text-center">P</th>
                        <th className="text-center">Skóre</th>
                        <th className="text-center">+/-</th>
                        <th className="text-right">Body</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamStandings.map((t, idx) => (
                        <tr
                          key={t.teamId}
                          className={
                            idx === 0
                              ? "bg-warning/10 font-bold"
                              : idx < 3
                              ? "font-semibold"
                              : ""
                          }
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
                          <td
                            className={`text-center tabular-nums text-sm font-semibold ${
                              t.cupDiff > 0
                                ? "text-success"
                                : t.cupDiff < 0
                                ? "text-error"
                                : ""
                            }`}
                          >
                            {t.cupDiff > 0 ? `+${t.cupDiff}` : t.cupDiff}
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

          {/* Žebříček střelců */}
          <section className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-6">
              <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                Střelci semestru
              </h2>
              <p className="text-sm text-base-content/70 mb-4">
                Individuální pořadí hráčů
              </p>

              {playerLeaderboard.length === 0 ? (
                <p className="text-base-content/60 italic py-6 text-center">
                  Žádná individuální data.
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
                            <Target className="w-3.5 h-3.5 text-primary" />
                            Góly
                          </span>
                        </th>
                        <th className="text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Wind className="w-3.5 h-3.5 text-info" />
                            BJ
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerLeaderboard.slice(0, 10).map((p, idx) => (
                        <tr
                          key={p.playerId}
                          className={idx === 0 ? "bg-warning/10 font-bold" : ""}
                        >
                          <td className="text-center">
                            <RankBadge rank={idx + 1} />
                          </td>
                          <td className="font-semibold">{p.playerName}</td>
                          <td className="text-center font-bold tabular-nums text-base text-primary">
                            {p.totalScore}
                          </td>
                          <td className="text-center tabular-nums text-info font-medium">
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
      </main>
    </div>
  );
}
