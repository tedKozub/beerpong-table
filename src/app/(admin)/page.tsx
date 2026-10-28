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
        <h1 className="text-3xl font-black mb-3">Beerpong liga</h1>
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
    <div className="min-h-screen p-3 sm:p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Hlavička stránky bez obřího hero banneru */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-base-300 pb-4 sm:pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Beerpong liga
          </h1>
          <p className="text-base-content/70 text-xs sm:text-sm mt-0.5">
            Přehled turnajových večerů, aktuální ligová tabulka týmů a střelci
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/seasons/${activeSeason.id}`}
            className="btn btn-primary btn-sm text-xs"
          >
            Správa semestru
          </Link>
          <Link href="/seasons" className="btn btn-outline btn-sm text-xs">
            Archiv
          </Link>
        </div>
      </div>

      {/* Přehled turnajových kol - čistý seznam */}
      <section className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
        <div className="card-body p-3.5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base sm:text-lg font-bold">Turnajové večery semestru</h2>
            <span className="text-xs text-base-content/60 tabular-nums font-semibold">
              {rounds.filter((r) => r.isCompleted).length} / {rounds.length} odehráno
            </span>
          </div>

          <div className="divide-y divide-base-200">
            {rounds.map((r) => (
              <div
                key={r.id}
                className="py-3 flex items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="badge badge-neutral font-black text-xs w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tabular-nums">
                    {r.roundNumber}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-base-content truncate">
                      {r.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-base-content/60">
                      {r.date
                        ? new Date(r.date).toLocaleDateString("cs-CZ")
                        : "Termín neurčen"}{" "}
                      • {r.isCompleted ? "Odehráno" : "Plánováno"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/rounds/${r.id}`}
                  className="btn btn-ghost btn-sm text-xs font-semibold shrink-0"
                >
                  <span className="hidden sm:inline">Otevřít večer →</span>
                  <span className="sm:hidden">Detail →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celková ligová tabulka */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-3.5 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-0.5">
            Celkové pořadí týmů za semestr
          </h2>
          <p className="text-xs text-base-content/70 mb-3 sm:mb-4">
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
                      className={
                        idx === 0
                          ? "bg-warning/15 font-bold"
                          : idx < 3
                          ? "font-semibold"
                          : ""
                      }
                    >
                      <td className="text-center px-1 sm:px-3">
                        <span className="font-bold tabular-nums">
                          {idx + 1}.
                        </span>
                      </td>
                      <td className="font-semibold px-2 sm:px-3">{t.teamName}</td>
                      <td className="text-center px-1 sm:px-3 tabular-nums">{t.played}</td>
                      <td className="text-center px-1 sm:px-3 text-success tabular-nums font-semibold">
                        {t.wins}
                      </td>
                      <td className="text-center px-1 sm:px-3 text-base-content/60 tabular-nums">
                        {t.draws}
                      </td>
                      <td className="text-center px-1 sm:px-3 text-error tabular-nums">
                        {t.losses}
                      </td>
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

      {/* Dvě tabulky střelců vedle sebe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Král střelců */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-3.5 sm:p-6">
            <h3 className="font-bold text-base mb-0.5">
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
                      <th className="w-10 text-center px-1 sm:px-2">Poř.</th>
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
                        <td className="text-center px-1 sm:px-2 tabular-nums font-semibold">
                          {idx + 1}.
                        </td>
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
        </section>

        {/* BlowJob King */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-3.5 sm:p-6">
            <h3 className="font-bold text-base mb-0.5">
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
                      <th className="w-10 text-center px-1 sm:px-2">Poř.</th>
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
                        <td className="text-center px-1 sm:px-2 tabular-nums font-semibold">
                          {idx + 1}.
                        </td>
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
        </section>
      </div>
    </div>
  );
}
