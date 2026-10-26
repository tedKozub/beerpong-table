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
import { RankBadge } from "@/components/RankBadge";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Shield,
  Target,
  Trash2,
  Trophy,
  User,
  Users,
  Wind,
} from "lucide-react";
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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-300 pb-6">
        <div>
          <div className="text-sm breadcrumbs mb-1">
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
            <h1 className="text-3xl sm:text-4xl font-black">
              {currentSeason.name}
            </h1>
            <span
              className={`badge ${
                currentSeason.isActive ? "badge-success gap-1.5" : "badge-ghost"
              } font-semibold whitespace-nowrap`}
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
                className="btn btn-outline btn-success btn-sm gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Nastavit jako aktivní semestr
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-6 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-base-content/70 text-sm font-semibold">
                Turnajové večery (Kola)
              </h2>
              <p className="text-4xl font-extrabold mt-1 tabular-nums">{rounds.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary opacity-60" />
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-6 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-base-content/70 text-sm font-semibold">
                Týmy v semestru
              </h2>
              <p className="text-4xl font-extrabold mt-1 tabular-nums">{teams.length}</p>
            </div>
            <Shield className="w-8 h-8 text-primary opacity-60" />
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-6 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-base-content/70 text-sm font-semibold">
                Registrovaní hráči
              </h2>
              <p className="text-4xl font-extrabold mt-1 tabular-nums">{players.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary opacity-60" />
          </div>
        </div>
      </div>

      {/* Turnajové večery (Kola) v této sezóně */}
      <section className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="card-title text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Kola semestru ({rounds.length})
              </h2>
              <p className="text-sm text-base-content/70">
                Jednotlivé večery, kdy se hrají zápasy
              </p>
            </div>

            {/* Formulář pro přidání kola */}
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
                className="input input-bordered input-sm flex-1 sm:w-56"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm gap-1">
                <Plus className="w-3.5 h-3.5" />
                Přidat kolo
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
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
                    href={`/rounds/${r.id}`}
                    className="btn btn-sm btn-outline btn-block mt-2"
                  >
                    Detail večera →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ligová tabulka a střelci */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabulka týmů */}
        <section className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-2">
          <div className="card-body p-6">
            <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-warning" />
              Průběžná tabulka semestru
            </h2>
            {teamStandings.length === 0 ? (
              <p className="text-base-content/60 italic py-6 text-center">
                V tomto semestru zatím nebyly odehrány žádné zápasy.
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
                      <th className="text-center">+/-</th>
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
                        <td className="font-semibold">{t.teamName}</td>
                        <td className="text-center tabular-nums">{t.played}</td>
                        <td className="text-center text-success tabular-nums">{t.wins}</td>
                        <td className="text-center text-base-content/60 tabular-nums">{t.draws}</td>
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
            {playerStats.length === 0 ? (
              <p className="text-base-content/60 italic py-6 text-center">
                Žádní střelci zatím nezaznamenáni.
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

      {/* Správa Týmů a Hráčů v sezóně */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Správa týmů */}
        <section className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Týmy v semestru
              </h2>
              <span className="badge badge-neutral tabular-nums font-semibold">{teams.length}</span>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";
                const name = formData.get("name") as string;
                if (name?.trim()) {
                  await createTeam({ name: name.trim(), seasonId });
                }
              }}
              className="flex gap-2 mb-4"
            >
              <input
                name="name"
                placeholder="Název nového týmu"
                className="input input-bordered input-sm flex-1"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm gap-1">
                <Plus className="w-3.5 h-3.5" />
                Přidat tým
              </button>
            </form>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-base-200"
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
                      className="btn btn-ghost btn-xs text-error gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Smazat
                    </button>
                  </form>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-base-content/60 italic text-sm py-4 text-center">
                  Zatím žádné týmy.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Správa hráčů */}
        <section className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Registrovaní hráči
              </h2>
              <span className="badge badge-neutral tabular-nums font-semibold">{players.length}</span>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";
                const name = formData.get("name") as string;
                if (name?.trim()) {
                  await createPlayer({ name: name.trim(), seasonId });
                }
              }}
              className="flex gap-2 mb-4"
            >
              <input
                name="name"
                placeholder="Jméno a příjmení hráče"
                className="input input-bordered input-sm flex-1"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm gap-1">
                <Plus className="w-3.5 h-3.5" />
                Registrovat hráče
              </button>
            </form>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-base-200"
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
                      className="btn btn-ghost btn-xs text-error gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Smazat
                    </button>
                  </form>
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-base-content/60 italic text-sm py-4 text-center">
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
