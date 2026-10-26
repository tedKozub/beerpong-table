import { getSeasonById, setActiveSeason } from "@/actions/seasons";
import { getRoundsForSeason, createRound } from "@/actions/rounds";
import { getTeamsForSeason, createTeam, deleteTeam } from "@/actions/teams";
import {
  getPlayersForSeason,
  createPlayer,
  deletePlayer,
} from "@/actions/players";
import {
  getSeasonPlayerLeaderboard,
  getSeasonTeamStandings,
} from "@/actions/stats";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SeasonDetailPage({
  params,
}: {
  params: { seasonId: string };
}) {
  const seasonId = Number(params.seasonId);
  if (isNaN(seasonId)) return notFound();

  const currentSeason = await getSeasonById(seasonId);
  if (!currentSeason) return notFound();

  const [rounds, teams, players, playerStats, teamStandings] =
    await Promise.all([
      getRoundsForSeason(seasonId),
      getTeamsForSeason(seasonId),
      getPlayersForSeason(seasonId),
      getSeasonPlayerLeaderboard(seasonId),
      getSeasonTeamStandings(seasonId),
    ]);

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
              <li className="font-semibold">{currentSeason.name}</li>
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black">
              {currentSeason.name}
            </h1>
            <span
              className={`badge ${
                currentSeason.isActive ? "badge-success gap-1.5" : "badge-ghost"
              } font-semibold whitespace-nowrap text-xs`}
            >
              {currentSeason.isActive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              )}
              {currentSeason.isActive ? "Aktivní semestr" : "Archiv"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!currentSeason.isActive && (
            <form
              action={async () => {
                "use server";
                await setActiveSeason(seasonId);
              }}
            >
              <button
                type="submit"
                className="btn btn-outline btn-success btn-sm text-xs"
              >
                Nastavit jako aktivní semestr
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Přehledové statistiky */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
          <h2 className="text-xs text-base-content/60 font-semibold">
            Turnajové večery (Kola)
          </h2>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">
            {rounds.length}
          </p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
          <h2 className="text-xs text-base-content/60 font-semibold">
            Týmy v semestru
          </h2>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">
            {teams.length}
          </p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
          <h2 className="text-xs text-base-content/60 font-semibold">
            Registrovaní hráči
          </h2>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">
            {players.length}
          </p>
        </div>
      </div>

      {/* Turnajové večery v této sezóně */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold">
                Kola semestru ({rounds.length})
              </h2>
              <p className="text-xs text-base-content/70">
                Jednotlivé večery, kdy se hrají zápasy
              </p>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";
                const name = formData.get("name") as string;
                if (name?.trim()) {
                  await createRound({
                    name: name.trim(),
                    seasonId,
                    roundNumber: rounds.length + 1,
                  });
                }
              }}
              className="flex gap-2 w-full sm:w-auto"
            >
              <input
                name="name"
                placeholder="Název kola (např. 6. Kolo)"
                className="input input-bordered input-xs sm:input-sm flex-1 sm:w-48"
                required
              />
              <button type="submit" className="btn btn-primary btn-xs sm:btn-sm">
                Přidat kolo
              </button>
            </form>
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
                  Detail večera →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ligová tabulka a střelci */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-1">Průběžná tabulka semestru</h2>
          {teamStandings.length === 0 ? (
            <p className="text-base-content/60 italic py-4 text-center text-xs">
              V tomto semestru zatím nebyly odehrány žádné zápasy.
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
                    <th className="text-center">+/-</th>
                    <th className="text-right">Body</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStandings.map((t, idx) => (
                    <tr
                      key={t.teamId}
                      className={idx === 0 ? "bg-warning/15 font-bold" : ""}
                    >
                      <td className="text-center font-bold tabular-nums">
                        {idx + 1}.
                      </td>
                      <td className="font-semibold">{t.teamName}</td>
                      <td className="text-center tabular-nums">{t.played}</td>
                      <td className="text-center text-success tabular-nums">{t.wins}</td>
                      <td className="text-center text-base-content/60 tabular-nums">{t.draws}</td>
                      <td className="text-center text-error tabular-nums">{t.losses}</td>
                      <td className="text-center tabular-nums">
                        {t.cupsScored}:{t.cupsConceded}
                      </td>
                      <td
                        className={`text-center tabular-nums text-xs font-semibold ${
                          t.cupDiff > 0
                            ? "text-success"
                            : t.cupDiff < 0
                            ? "text-error"
                            : ""
                        }`}
                      >
                        {t.cupDiff > 0 ? `+${t.cupDiff}` : t.cupDiff}
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

      {/* Správa Týmů a Hráčů v sezóně */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Správa týmů */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 sm:p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold">Týmy v semestru</h2>
              <span className="badge badge-neutral text-xs tabular-nums font-semibold">
                {teams.length}
              </span>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";
                const name = formData.get("name") as string;
                if (name?.trim()) {
                  await createTeam({ name: name.trim(), seasonId });
                }
              }}
              className="flex gap-2 mb-3"
            >
              <input
                name="name"
                placeholder="Název nového týmu"
                className="input input-bordered input-xs sm:input-sm flex-1"
                required
              />
              <button type="submit" className="btn btn-primary btn-xs sm:btn-sm">
                Přidat tým
              </button>
            </form>

            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center px-3 py-2 rounded-lg bg-base-200/60 text-xs"
                >
                  <span className="font-semibold">{t.name}</span>
                  <form
                    action={async () => {
                      "use server";
                      await deleteTeam(t.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    >
                      Smazat
                    </button>
                  </form>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-base-content/60 italic text-xs py-3 text-center">
                  Zatím žádné týmy.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Správa hráčů */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 sm:p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold">Registrovaní hráči</h2>
              <span className="badge badge-neutral text-xs tabular-nums font-semibold">
                {players.length}
              </span>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";
                const name = formData.get("name") as string;
                if (name?.trim()) {
                  await createPlayer({ name: name.trim(), seasonId });
                }
              }}
              className="flex gap-2 mb-3"
            >
              <input
                name="name"
                placeholder="Jméno a příjmení hráče"
                className="input input-bordered input-xs sm:input-sm flex-1"
                required
              />
              <button type="submit" className="btn btn-primary btn-xs sm:btn-sm">
                Registrovat hráče
              </button>
            </form>

            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center px-3 py-2 rounded-lg bg-base-200/60 text-xs"
                >
                  <span className="font-semibold">{p.name}</span>
                  <form
                    action={async () => {
                      "use server";
                      await deletePlayer(p.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    >
                      Smazat
                    </button>
                  </form>
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-base-content/60 italic text-xs py-3 text-center">
                  Zatím žádní hráči.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
