import { getActiveSeason } from "@/actions/seasons";
import { getRoundsForSeason } from "@/actions/rounds";
import {
  getSeasonPlayerLeaderboard,
  getSeasonTeamStandings,
} from "@/actions/stats";
import Link from "next/link";

export default async function HomePage() {
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-3">BeerPong Liga</h1>
        <p className="text-base-content/70 text-base mb-6">
          V systému zatím není nastavena žádná aktivní sezóna semestru.
        </p>
        <Link href="/seasons" className="btn btn-primary btn-sm">
          Přejít do správy semestrů
        </Link>
      </div>
    );
  }

  const [rounds, teamStandings, playerLeaderboard] = await Promise.all([
    getRoundsForSeason(activeSeason.id),
    getSeasonTeamStandings(activeSeason.id),
    getSeasonPlayerLeaderboard(activeSeason.id),
  ]);

  const scoreLeaderboard = [...playerLeaderboard].sort(
    (a, b) => b.totalScore - a.totalScore
  );
  const bjLeaderboard = [...playerLeaderboard].sort(
    (a, b) => b.totalBlowjobs - a.totalBlowjobs
  );

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Hlavička stránky bez obřího hero banneru */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-300 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            BeerPong Liga • {activeSeason.name}
          </h1>
          <p className="text-base-content/70 text-xs sm:text-sm mt-0.5">
            Přehled turnajových večerů, aktuální ligová tabulka týmů a střelci
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/seasons/${activeSeason.id}`}
            className="btn btn-primary btn-sm"
          >
            Správa semestru
          </Link>
          <Link href="/seasons" className="btn btn-outline btn-sm">
            Archiv
          </Link>
        </div>
      </div>

      {/* Přehled turnajových kol - čistý seznam */}
      <section className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
        <div className="card-body p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Turnajové večery semestru</h2>
            <span className="text-xs text-base-content/60 tabular-nums font-semibold">
              {rounds.filter((r) => r.isCompleted).length} / {rounds.length} odehráno
            </span>
          </div>

          <div className="divide-y divide-base-200">
            {rounds.map((r) => (
              <div
                key={r.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="badge badge-neutral font-black text-xs w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tabular-nums">
                    {r.roundNumber}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-base-content truncate">
                      {r.name}
                    </h3>
                    <p className="text-xs text-base-content/60">
                      {r.date
                        ? new Date(r.date).toLocaleDateString("cs-CZ")
                        : "Termín neurčen"}{" "}
                      • {r.isCompleted ? "Odehráno" : "Plánováno"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/rounds/${r.id}`}
                  className="btn btn-ghost btn-sm text-xs font-semibold"
                >
                  Otevřít večer →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celková ligová tabulka */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-1">
            Celkové pořadí týmů za semestr
          </h2>
          <p className="text-xs text-base-content/70 mb-4">
            Součet bodů ze všech odehraných kol
          </p>

          {teamStandings.length === 0 ? (
            <p className="text-base-content/60 italic py-6 text-center text-sm">
              Zatím nebyly zaznamenány žádné výsledky zápasů.
            </p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table table-sm sm:table-md w-full">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-12 text-center">Poř.</th>
                    <th>Tým</th>
                    <th className="text-center">Zápasy</th>
                    <th className="text-center">Výhry</th>
                    <th className="text-center">Remízy</th>
                    <th className="text-center">Prohry</th>
                    <th className="text-right">Body</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStandings.map((t, idx) => (
                    <tr
                      key={t.teamId}
                      className={
                        idx === 0
                          ? "bg-warning/15 font-bold"
                          : idx < 3
                          ? "font-semibold"
                          : ""
                      }
                    >
                      <td className="text-center">
                        <span className="font-bold tabular-nums">
                          {idx + 1}.
                        </span>
                      </td>
                      <td className="font-semibold">{t.teamName}</td>
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

      {/* Dvě tabulky střelců vedle sebe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Král střelců */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 sm:p-6">
            <h3 className="font-bold text-base mb-1">
              Král střelců semestru
            </h3>
            <p className="text-xs text-base-content/60 mb-3">
              Trefené kelímky
            </p>

            {scoreLeaderboard.length === 0 ? (
              <p className="text-base-content/60 italic py-4 text-center text-xs">
                Žádná individuální data.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="bg-base-200/50">
                      <th className="w-10 text-center">Poř.</th>
                      <th>Hráč</th>
                      <th className="text-right">Skóre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreLeaderboard.slice(0, 8).map((p, idx) => (
                      <tr
                        key={p.playerId}
                        className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                      >
                        <td className="text-center tabular-nums font-semibold">
                          {idx + 1}.
                        </td>
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
        </section>

        {/* BlowJob King */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 sm:p-6">
            <h3 className="font-bold text-base mb-1">
              BlowJob King semestru
            </h3>
            <p className="text-xs text-base-content/60 mb-3">
              Vyfouknuté kelímky
            </p>

            {bjLeaderboard.length === 0 ? (
              <p className="text-base-content/60 italic py-4 text-center text-xs">
                Žádná individuální data.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="bg-base-200/50">
                      <th className="w-10 text-center">Poř.</th>
                      <th>Hráč</th>
                      <th className="text-right">Počet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bjLeaderboard.slice(0, 8).map((p, idx) => (
                      <tr
                        key={p.playerId}
                        className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                      >
                        <td className="text-center tabular-nums font-semibold">
                          {idx + 1}.
                        </td>
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
        </section>
      </div>
    </div>
  );
}
