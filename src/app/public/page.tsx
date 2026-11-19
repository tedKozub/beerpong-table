import { getActiveSeason } from "@/actions/seasons";
import { getRoundsForSeason } from "@/actions/rounds";
import {
  getSeasonPlayerLeaderboard,
  getSeasonTeamStandings,
} from "@/actions/stats";
import { PublicNavbar } from "@/components/PublicNavbar";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { StandingsTable } from "@/components/StandingsTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PublicOverviewPage() {
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200">
        <PublicNavbar />
        <main className="max-w-7xl mx-auto w-full p-3 sm:p-6 md:p-8 flex flex-col gap-6 items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 tracking-tight">
            🦊 SPPDF Beerpong
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
    <div className="min-h-screen flex flex-col bg-base-200">
      <PublicNavbar seasonName={activeSeason.name} />

      <main className="max-w-7xl mx-auto w-full p-3 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8 items-center">
        {/* Titulek */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 tracking-tight">
            🦊 SPPDF Beerpong
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

                <StandingsTable
                  standings={teamStandings}
                  emptyText="Zatím nebyly zaznamenány žádné výsledky zápasů."
                />
              </div>
            </div>

            {/* Dvě tabulky střelců vedle sebe - zarovnané na 100 % šířky jako v PR #27 */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <LeaderboardCard
                title="Historicky Král střelců"
                subtitle="Trefené kelímky"
                players={scoreLeaderboard}
                type="score"
                previewLimit={5}
                variant="public"
              />
              <LeaderboardCard
                title="Historicky BlowJob King"
                subtitle="Vyfouknuté kelímky"
                players={bjLeaderboard}
                type="blowjob"
                previewLimit={5}
                variant="public"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
