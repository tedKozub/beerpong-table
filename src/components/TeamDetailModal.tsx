"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeamDetailStats, TeamDetailData } from "@/actions/stats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Users } from "lucide-react";

interface TeamDetailModalProps {
  teamId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamDetailModal({
  teamId,
  isOpen,
  onOpenChange,
}: TeamDetailModalProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<TeamDetailData | null>({
    queryKey: ["teamDetail", teamId],
    queryFn: () => (teamId ? getTeamDetailStats(teamId) : Promise.resolve(null)),
    enabled: Boolean(teamId && isOpen),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl min-h-[380px] max-h-[88vh] flex flex-col p-4 sm:p-6 bg-base-100 border border-base-300 shadow-2xl">
        <DialogHeader className="space-y-1 border-b border-base-200 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <span>Profil a historie týmu</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-base-content/70">
            Soupisky hráčů podle kol, zápasová bilance a celkové ligové skóre
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-base-content/60 font-medium">
              Načítám statistiky týmu...
            </p>
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-xs text-error">
            Nepodařilo se načíst data: {(error as Error)?.message || "Neznámá chyba"}
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="flex flex-col gap-4 overflow-y-auto pt-2 pr-1">
            {/* Jméno a hlavní čísla týmu */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200/60 p-3.5 rounded-xl border border-base-300">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-base-content">
                  {data.team.name}
                </h3>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Ligová bilance v semestru
                </p>
              </div>

              {/* Statistiky v sezóně */}
              {data.standings ? (
                <div className="flex items-center gap-2 text-xs">
                  <div className="bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 text-center">
                    <div className="text-[10px] text-base-content/60 uppercase font-bold">Body</div>
                    <div className="font-black text-base text-primary tabular-nums">
                      {data.standings.points}
                    </div>
                  </div>

                  <div className="bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 text-center">
                    <div className="text-[10px] text-base-content/60 uppercase font-bold">Skóre</div>
                    <div className="font-bold text-sm text-base-content tabular-nums">
                      {data.standings.cupsScored}:{data.standings.cupsConceded}
                    </div>
                  </div>

                  <div className="bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 text-center">
                    <div className="text-[10px] text-base-content/60 uppercase font-bold">Zápasy</div>
                    <div className="font-bold text-base text-base-content tabular-nums">
                      {data.standings.played}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-base-content/60 italic">Zatím neodehrál zápas</span>
              )}
            </div>

            {/* Bilance V - R - P */}
            {data.standings && (
              <div className="flex items-center justify-between px-2 text-xs font-medium text-base-content/75">
                <span>
                  Výsledky:{" "}
                  <strong className="text-success">{data.standings.wins} výher</strong> –{" "}
                  <strong className="text-base-content/60">{data.standings.draws} remíz</strong> –{" "}
                  <strong className="text-error">{data.standings.losses} proher</strong>
                </span>
                <span className="tabular-nums">
                  Rozdíl:{" "}
                  <strong
                    className={
                      data.standings.cupDiff > 0
                        ? "text-success"
                        : data.standings.cupDiff < 0
                        ? "text-error"
                        : ""
                    }
                  >
                    {data.standings.cupDiff > 0 ? `+${data.standings.cupDiff}` : data.standings.cupDiff}
                  </strong>
                </span>
              </div>
            )}

            {/* Soupisky týmu v jednotlivých kolech */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                Hráči, kteří za tým nastoupili ({data.rosterHistory.length} kol)
              </h4>

              {data.rosterHistory.length === 0 ? (
                <p className="text-xs text-base-content/60 italic py-3 text-center border border-base-200 rounded-lg">
                  Tým zatím nemá přiřazenou žádnou soupisku v kolech.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.rosterHistory.map((r) => (
                    <div
                      key={r.roundId}
                      className="bg-base-200/50 p-2.5 rounded-lg border border-base-300 flex flex-col gap-1 text-xs"
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>#{r.roundNumber} {r.roundName}</span>
                        <span className="badge badge-neutral badge-xs tabular-nums">
                          {r.players.length} hráči
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {r.players.map((pl) => (
                          <span
                            key={pl}
                            className="badge badge-ghost badge-sm text-[11px] font-semibold"
                          >
                            {pl}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Zápasová historie týmu */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                Zápasy v sezóně ({data.matchHistory.length})
              </h4>

              {data.matchHistory.length === 0 ? (
                <p className="text-xs text-base-content/60 italic py-4 text-center">
                  Tým zatím v této sezóně neodehrál žádný zápas.
                </p>
              ) : (
                <div className="overflow-x-auto border border-base-200 rounded-xl">
                  <table className="table table-xs w-full">
                    <thead>
                      <tr className="bg-base-200/70 text-[11px] text-base-content/70">
                        <th>Kolo</th>
                        <th>Soupeř</th>
                        <th className="text-center">Skóre</th>
                        <th className="text-right">Výsledek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.matchHistory.map((m) => (
                        <tr key={m.matchId} className="hover:bg-base-200/40">
                          <td className="font-semibold text-xs whitespace-nowrap">
                            #{m.roundNumber} {m.roundName}
                          </td>
                          <td className="font-medium text-xs">
                            {m.opponentName}
                          </td>
                          <td className="text-center font-bold tabular-nums">
                            {m.teamScore}:{m.opponentScore}
                          </td>
                          <td className="text-right">
                            <span
                              className={`badge badge-xs font-bold ${
                                m.result === "W"
                                  ? "badge-success text-white"
                                  : m.result === "L"
                                  ? "badge-error text-white"
                                  : "badge-ghost"
                              }`}
                            >
                              {m.result === "W" ? "Výhra" : m.result === "L" ? "Prohra" : "Remíza"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
