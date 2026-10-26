"use server";
import { getPlayersForTournamentId } from "@/actions/players";
import { getTeamsForTournamentSorted } from "@/actions/teams";
import { getTournamentById } from "@/actions/tournaments";
import ExportCSVButton from "@/components/ExportCSVButton";
import SharePublicLink from "@/components/SharePublicLink";
import Link from "next/link";

export default async function Home(params: {
  params: { tournamentid: number };
}) {
  const tournamentId = Number(params.params.tournamentid);
  const [playersBJ, playersSC, teamsOrdered, tournament] = await Promise.all([
    getPlayersForTournamentId(tournamentId),
    getPlayersForTournamentId(tournamentId),
    getTeamsForTournamentSorted(tournamentId),
    getTournamentById(tournamentId),
  ]);

  const playersSortedByBlowjobs = [...playersBJ].sort(
    (a, b) => (Number(b.blowjobs) ?? 0) - (Number(a.blowjobs) ?? 0)
  );
  const playersSortedByScore = [...playersSC].sort(
    (a, b) => (Number(b.score) ?? 0) - (Number(a.score) ?? 0)
  );

  const tournamentName = tournament?.name ?? "Turnaj";

  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12 bg-base-200 text-base-content">
      <main className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href={`/${tournamentId}`}
              className="text-xs font-semibold text-primary hover:underline mb-2 inline-block"
            >
              ← Zpět na rozpis turnaje
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-base-content">
              {tournamentName} · Výsledky a statistiky
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SharePublicLink tournamentId={tournamentId} />
            <ExportCSVButton
              teams={teamsOrdered}
              playersByScore={playersSortedByScore}
              playersByBlowjobs={playersSortedByBlowjobs}
              tournamentName={tournamentName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Týmové pořadí */}
          <div className="card bg-base-100 p-6 rounded-2xl border border-base-300 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-center text-base-content">
              Celkové skóre týmů
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-center">
                <thead className="bg-base-200 text-base-content">
                  <tr>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70">Pořadí</th>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70 text-left">Tým</th>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70 text-right">Skóre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {teamsOrdered.map((team, idx) => (
                    <tr key={team.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="py-3 font-bold">
                        {idx === 0 ? (
                          <span className="badge badge-warning text-xs font-black">1.</span>
                        ) : idx === 1 ? (
                          <span className="badge badge-ghost text-xs font-bold">2.</span>
                        ) : idx === 2 ? (
                          <span className="badge badge-ghost text-xs font-bold">3.</span>
                        ) : (
                          `${idx + 1}.`
                        )}
                      </td>
                      <td className="py-3 text-left font-semibold text-base-content">{team.name}</td>
                      <td className="py-3 text-right font-black text-success">{team.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Král střelců */}
          <div className="card bg-base-100 p-6 rounded-2xl border border-base-300 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-center text-base-content">
              Král střelců
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-center">
                <thead className="bg-base-200 text-base-content">
                  <tr>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70">Pořadí</th>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70 text-left">Hráč</th>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70 text-right">Body</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {playersSortedByScore.map((player, idx) => (
                    <tr key={player.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="py-3 font-bold">
                        {idx === 0 ? (
                          <span className="badge badge-warning text-xs font-black">1.</span>
                        ) : idx === 1 ? (
                          <span className="badge badge-ghost text-xs font-bold">2.</span>
                        ) : idx === 2 ? (
                          <span className="badge badge-ghost text-xs font-bold">3.</span>
                        ) : (
                          `${idx + 1}.`
                        )}
                      </td>
                      <td className="py-3 text-left font-semibold text-base-content">{player.name}</td>
                      <td className="py-3 text-right font-black text-primary">{player.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BlowJob King */}
          <div className="card bg-base-100 p-6 rounded-2xl border border-base-300 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-center text-base-content">
              BlowJob King
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-center">
                <thead className="bg-base-200 text-base-content">
                  <tr>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70">Pořadí</th>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70 text-left">Hráč</th>
                    <th className="py-3 px-3 text-xs font-bold text-base-content/70 text-right">BJ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {playersSortedByBlowjobs.map((player, idx) => (
                    <tr key={player.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="py-3 font-bold">
                        {idx === 0 ? (
                          <span className="badge badge-info text-xs font-black">1.</span>
                        ) : idx === 1 ? (
                          <span className="badge badge-ghost text-xs font-bold">2.</span>
                        ) : idx === 2 ? (
                          <span className="badge badge-ghost text-xs font-bold">3.</span>
                        ) : (
                          `${idx + 1}.`
                        )}
                      </td>
                      <td className="py-3 text-left font-semibold text-base-content">{player.name}</td>
                      <td className="py-3 text-right font-black text-info">{player.blowjobs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
