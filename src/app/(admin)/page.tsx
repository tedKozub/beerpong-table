import { getActiveSeason } from "@/actions/seasons";
import { getRoundsForSeason } from "@/actions/rounds";
import {
  getSeasonPlayerLeaderboard,
  getSeasonTeamStandings,
} from "@/actions/stats";
import { RankBadge } from "@/components/RankBadge";
import {
  Archive,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Settings,
  Target,
  Trophy,
  Wind,
} from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4">🦊 SPPDF BeerPong Liga</h1>
        <p className="text-base-content/70 text-lg mb-8">
          V systému zatím není nastavena žádná aktivní sezóna semestru.
        </p>
        <Link href="/seasons" className="btn btn-primary">
          Přejít do správy semestrů →
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
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Hero sekce aktivní sezóny */}
      <div className="hero bg-base-200 rounded-3xl p-6 sm:p-10 border border-base-300">
        <div className="hero-content flex-col lg:flex-row justify-between w-full gap-8">
          <div className="text-left max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-success gap-1.5 font-semibold whitespace-nowrap">
                <span className="inline-block w-2 h-2 rounded-full bg-current opacity-80" />
                Aktivní semestr
              </span>
              <span className="text-xs text-base-content/60">
                {rounds.length} turnajových večerů
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              {activeSeason.name}
            </h1>
            <p className="py-3 text-base-content/80 text-base sm:text-lg">
              Oficiální systém BeerPong ligy. Přehled turnajových večerů, aktuální
              ligová tabulka týmů a statistiky střelců za semestr.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href={`/seasons/${activeSeason.id}`}
                className="btn btn-primary btn-sm sm:btn-md gap-2"
              >
                <Settings className="w-4 h-4" />
                Správa semestru (týmy a hráči)
              </Link>
              <Link
                href="/seasons"
                className="btn btn-outline btn-sm sm:btn-md gap-2"
              >
                <Archive className="w-4 h-4" />
                Archiv minulých semestrů
              </Link>
            </div>
          </div>

          {/* Rychlý box králů semestru */}
          <div className="card bg-base-100 shadow-md border border-base-300 w-full lg:w-80">
            <div className="card-body p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/60 mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4 text-warning" />
                Králové semestru
              </h3>
              {playerLeaderboard.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div>
                      <div className="text-xs text-warning-content font-bold flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-warning" />
                        KRÁL STŘELCŮ
                      </div>
                      <div className="font-extrabold text-base mt-0.5">
                        {topScorer?.playerName ?? "Zatím nikdo"}
                      </div>
                    </div>
                    <div className="text-xl font-black text-warning tabular-nums">
                      {topScorer?.totalScore ?? 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-info/10 border border-info/20">
                    <div>
                      <div className="text-xs text-info-content font-bold flex items-center gap-1.5">
                        <Wind className="w-3.5 h-3.5 text-info" />
                        BLOWJOB KING
                      </div>
                      <div className="font-extrabold text-base mt-0.5">
                        {bjKing?.playerName ?? "Zatím nikdo"}
                      </div>
                    </div>
                    <div className="text-xl font-black text-info tabular-nums">
                      {bjKing?.totalBlowjobs ?? 0}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-base-content/60 italic py-4 text-center">
                  Zatím žádná odehraná kola v tomto semestru.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid turnajových večerů (Kola 1 až 5) */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Turnajové večery (Kola)
          </h2>
          <span className="text-xs text-base-content/60 font-semibold">
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
                  <h3 className="font-extrabold text-lg mt-1 line-clamp-1">
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
                  href={`/rounds/${r.id}`}
                  className="btn btn-sm btn-outline btn-block mt-2"
                >
                  Detail kola →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Společný přehled: Celková tabulka ligy a Žebříček střelců */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ligová tabulka týmů */}
        <section className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-2">
          <div className="card-body p-6">
            <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-warning" />
              Celkové pořadí týmů za semestr
            </h2>
            <p className="text-sm text-base-content/70 mb-4">
              Součet bodů a skóre ze všech odehraných kol aktuálního semestru
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
                        <td className="text-center text-success tabular-nums">
                          {t.wins}
                        </td>
                        <td className="text-center text-base-content/60 tabular-nums">
                          {t.draws}
                        </td>
                        <td className="text-center text-error tabular-nums">
                          {t.losses}
                        </td>
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

        {/* Žebříček střelců za semestr */}
        <section className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              Král střelců semestru
            </h2>
            <p className="text-sm text-base-content/70 mb-4">
              Individuální žebříček hráčů (hráč sbírá body i při změně týmu)
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
                          Kelímky
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
    </div>
  );
}
