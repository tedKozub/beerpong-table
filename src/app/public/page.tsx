import { getActiveSeason } from "@/actions/seasons";
import { getRoundsForSeason } from "@/actions/rounds";
import {
  getSeasonPlayerLeaderboard,
  getSeasonTeamStandings,
} from "@/actions/stats";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export const dynamic = "force-dynamic";

function renderRank(idx: number) {
  if (idx === 0) {
    return (
      <span className="badge badge-warning font-black text-xs h-6 sm:h-7 min-w-[1.75rem] px-1 shadow-sm inline-flex items-center justify-center whitespace-nowrap">
        <span className="relative inline-flex items-center justify-center">
          <span className="tabular-nums">1</span>
          <span className="absolute left-full top-0 select-none">.</span>
        </span>
      </span>
    );
  }
  if (idx === 1) {
    return (
      <span className="badge badge-ghost bg-slate-300 text-slate-900 border-slate-300 font-bold text-xs h-6 sm:h-7 min-w-[1.75rem] px-1 shadow-sm inline-flex items-center justify-center whitespace-nowrap">
        <span className="relative inline-flex items-center justify-center">
          <span className="tabular-nums">2</span>
          <span className="absolute left-full top-0 select-none">.</span>
        </span>
      </span>
    );
  }
  if (idx === 2) {
    return (
      <span className="badge badge-ghost bg-amber-800 text-amber-100 border-amber-800 font-bold text-xs h-6 sm:h-7 min-w-[1.75rem] px-1 shadow-sm inline-flex items-center justify-center whitespace-nowrap">
        <span className="relative inline-flex items-center justify-center">
          <span className="tabular-nums">3</span>
          <span className="absolute left-full top-0 select-none">.</span>
        </span>
      </span>
    );
  }
  return (
    <span className="text-base-content/70 font-medium pl-1 sm:pl-2 tabular-nums">
      {idx + 1}.
    </span>
  );
}

function getRowStyle(idx: number) {
  if (idx === 0)
    return "bg-warning/15 font-bold hover:bg-warning/25 transition-colors";
  if (idx === 1)
    return "bg-base-200/80 font-semibold hover:bg-base-200 transition-colors";
  if (idx === 2)
    return "bg-base-200/50 font-medium hover:bg-base-200 transition-colors";
  return "hover:bg-base-200/40 transition-colors";
}

export default async function PublicOverviewPage() {
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return (
      <div className="min-h-screen px-3 py-6 sm:px-6 sm:py-10 md:p-12">
        <main className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 tracking-tight">
            🦊 SPPDF Beer Pong
          </h1>
          <p className="text-base-content/70 text-base sm:text-lg">
            V současné chvíli není vyhlášena žádná aktivní sezóna semestru.
          </p>
          <Link href="/about" className="btn btn-outline btn-sm mt-4">
            O lize & Pravidla
          </Link>
        </main>
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
    <div className="min-h-screen px-3 py-6 sm:px-6 sm:py-10 md:p-12">
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between pb-4 mb-2">
        <Link
          href="/public"
          className="btn btn-ghost font-black text-lg gap-2 text-base-content px-2"
        >
          🦊 SPPDF
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content hidden sm:inline-flex"
          >
            O lize & Pravidla
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="btn btn-ghost btn-sm text-xs font-semibold border border-base-300 text-base-content"
          >
            Přihlášení
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 sm:gap-8 md:gap-10 items-center">
        {/* Titulek */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 tracking-tight">
            🦊 SPPDF Beer Pong
          </h1>
          <p className="text-base-content/70 text-sm sm:text-base md:text-lg">
            Oficiální výsledky turnajů • {activeSeason.name}
          </p>
        </div>

        {/* Turnaje a turnajové večery List */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Turnajové večery (Kola)
            </h2>
            <span className="badge badge-neutral text-xs font-semibold px-2.5 py-1 tabular-nums">
              {rounds.length} kol
            </span>
          </div>

          <div className="card bg-base-100 w-full shadow-lg border border-base-200 overflow-hidden">
            <div className="divide-y divide-base-200">
              {rounds.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 sm:p-4 hover:bg-base-200/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="badge badge-neutral font-black text-xs w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 tabular-nums">
                      {r.roundNumber}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-base-content truncate">
                        {r.name}
                      </h3>
                      <p className="text-xs text-base-content/60">
                        {r.date
                          ? new Date(r.date).toLocaleDateString("cs-CZ")
                          : "Termín večera nebyl upřesněn"}{" "}
                        • {r.isCompleted ? "Odehráno" : "Čeká se na odehrání"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/public/rounds/${r.id}`}
                    className="btn btn-primary btn-sm sm:btn-md gap-1.5 shrink-0 self-end sm:self-center"
                  >
                    <span>Zobrazit výsledky</span>
                    <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Celkové Týmové Pořadí */}
        <section className="w-full">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="card bg-base-100 w-full shadow-lg border border-base-200">
              <div className="card-body p-3.5 sm:p-6">
                <h3 className="card-title text-base sm:text-xl justify-center mb-3">
                  Celkové Týmové Pořadí
                </h3>

                {teamStandings.length === 0 ? (
                  <p className="text-center text-base-content/60 italic py-6">
                    Zatím nebyly zaznamenány žádné výsledky zápasů.
                  </p>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="table table-sm sm:table-md w-full">
                      <thead>
                        <tr>
                          <th className="w-14 sm:w-20 px-2 sm:px-3 text-center sm:text-left">
                            Pořadí
                          </th>
                          <th className="px-2 sm:px-3">Tým</th>
                          <th className="text-center px-1 sm:px-3">Zápasy</th>
                          <th className="text-center px-1 sm:px-3">Výhry</th>
                          <th className="text-center px-1 sm:px-3">Remízy</th>
                          <th className="text-center px-1 sm:px-3">Prohry</th>
                          <th className="text-right px-2 sm:px-3">Body</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamStandings.map((t, idx) => (
                          <tr key={t.teamId} className={getRowStyle(idx)}>
                            <td className="w-14 sm:w-20 px-2 sm:px-3">
                              {renderRank(idx)}
                            </td>
                            <td className="px-2 sm:px-3 font-semibold sm:font-normal">
                              {t.teamName}
                            </td>
                            <td className="text-center px-1 sm:px-3 tabular-nums">
                              {t.played}
                            </td>
                            <td className="text-center px-1 sm:px-3 text-success font-semibold tabular-nums">
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
            </div>

            {/* Dvě tabulky střelců vedle sebe - zarovnané na 100 % šířky jako v PR #27 */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Historicky Král střelců */}
              <div className="card bg-base-100 w-full shadow-lg border border-base-200">
                <div className="card-body p-3.5 sm:p-6">
                  <h3 className="card-title text-base sm:text-xl justify-center mb-3">
                    Historicky Král střelců
                  </h3>
                  {scoreLeaderboard.length === 0 ? (
                    <p className="text-center text-base-content/60 italic py-6">
                      Žádná individuální data.
                    </p>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="table table-sm sm:table-md w-full">
                        <thead>
                          <tr>
                            <th className="w-14 sm:w-20 px-2 sm:px-3 text-center sm:text-left">
                              Pořadí
                            </th>
                            <th className="px-2 sm:px-3">Hráč</th>
                            <th className="text-right px-2 sm:px-3">Skóre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scoreLeaderboard.slice(0, 10).map((p, idx) => (
                            <tr key={p.playerId} className={getRowStyle(idx)}>
                              <td className="w-14 sm:w-20 px-2 sm:px-3">
                                {renderRank(idx)}
                              </td>
                              <td className="px-2 sm:px-3 font-semibold sm:font-normal">
                                {p.playerName}
                              </td>
                              <td className="text-right px-2 sm:px-3 font-bold tabular-nums">
                                {p.totalScore}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Historicky BlowJob King */}
              <div className="card bg-base-100 w-full shadow-lg border border-base-200">
                <div className="card-body p-3.5 sm:p-6">
                  <h3 className="card-title text-base sm:text-xl justify-center mb-3">
                    Historicky BlowJob King
                  </h3>
                  {bjLeaderboard.length === 0 ? (
                    <p className="text-center text-base-content/60 italic py-6">
                      Žádná individuální data.
                    </p>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="table table-sm sm:table-md w-full">
                        <thead>
                          <tr>
                            <th className="w-14 sm:w-20 px-2 sm:px-3 text-center sm:text-left">
                              Pořadí
                            </th>
                            <th className="px-2 sm:px-3">Hráč</th>
                            <th className="text-right px-2 sm:px-3">Počet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bjLeaderboard.slice(0, 10).map((p, idx) => (
                            <tr key={p.playerId} className={getRowStyle(idx)}>
                              <td className="w-14 sm:w-20 px-2 sm:px-3">
                                {renderRank(idx)}
                              </td>
                              <td className="px-2 sm:px-3 font-semibold sm:font-normal">
                                {p.playerName}
                              </td>
                              <td className="text-right px-2 sm:px-3 font-bold tabular-nums">
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
