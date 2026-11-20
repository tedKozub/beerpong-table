"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlayerDetailStats, PlayerDetailData } from "@/actions/stats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Shield, Trophy } from "lucide-react";

interface PlayerDetailModalProps {
  playerId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayerDetailModal({
  playerId,
  isOpen,
  onOpenChange,
}: PlayerDetailModalProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<PlayerDetailData | null>({
    queryKey: ["playerDetail", playerId],
    queryFn: () => (playerId ? getPlayerDetailStats(playerId) : Promise.resolve(null)),
    enabled: Boolean(playerId && isOpen),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl min-h-[380px] max-h-[88vh] flex flex-col p-4 sm:p-6 bg-base-100 border border-base-300 shadow-2xl">
        <DialogHeader className="space-y-1 border-b border-base-200 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <span>Profil a statistiky hráče</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-base-content/70">
            Detailní rozpis výkonů, celkové skóre a zápasová historie v semestru
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-base-content/60 font-medium">
              Načítám statistiky hráče...
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
            {/* Jméno a hlavní čísla */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200/60 p-3.5 rounded-xl border border-base-300">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-base-content">
                  {data.player.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-base-content/60 font-medium">Týmy:</span>
                  {data.teamsPlayedFor.map((t) => (
                    <span key={t} className="badge badge-neutral badge-xs font-semibold">
                      {t}
                    </span>
                  ))}
                  {data.teamsPlayedFor.length === 0 && (
                    <span className="text-xs text-base-content/50 italic">Zatím bez týmu</span>
                  )}
                </div>
              </div>

              {/* Rychlé statistiky */}
              <div className="flex items-center gap-2 text-xs">
                <div className="bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 text-center">
                  <div className="text-[10px] text-base-content/60 uppercase font-bold">Body</div>
                  <div className="font-black text-base text-primary tabular-nums">
                    {data.stats.totalScore}
                  </div>
                </div>

                <div className="bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 text-center">
                  <div className="text-[10px] text-base-content/60 uppercase font-bold">BlowJob</div>
                  <div className="font-black text-base text-info tabular-nums">
                    {data.stats.totalBlowjobs}
                  </div>
                </div>

                <div className="bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 text-center">
                  <div className="text-[10px] text-base-content/60 uppercase font-bold">Zápasy</div>
                  <div className="font-bold text-base text-base-content tabular-nums">
                    {data.stats.matchesPlayed}
                  </div>
                </div>
              </div>
            </div>

            {/* Bilance */}
            <div className="flex items-center justify-between px-2 text-xs font-medium text-base-content/75">
              <span>
                Bilance týmu hráče:{" "}
                <strong className="text-success">{data.stats.wins}V</strong> –{" "}
                <strong className="text-base-content/60">{data.stats.draws}R</strong> –{" "}
                <strong className="text-error">{data.stats.losses}P</strong>
              </span>
            </div>

            {/* Historie zápasů */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                Odehraná utkání ({data.matchHistory.length})
              </h4>

              {data.matchHistory.length === 0 ? (
                <p className="text-xs text-base-content/60 italic py-4 text-center">
                  Hráč v této sezóně zatím neodehrál žádný zápas.
                </p>
              ) : (
                <div className="overflow-x-auto border border-base-200 rounded-xl">
                  <table className="table table-xs w-full">
                    <thead>
                      <tr className="bg-base-200/70 text-[11px] text-base-content/70">
                        <th>Kolo</th>
                        <th>Tým hráče</th>
                        <th className="text-center">Zápas</th>
                        <th>Soupeř</th>
                        <th className="text-right">Trefeno</th>
                        <th className="text-right">BJ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.matchHistory.map((m) => (
                        <tr key={m.matchId} className="hover:bg-base-200/40">
                          <td className="font-semibold text-xs whitespace-nowrap">
                            #{m.roundNumber} {m.roundName}
                          </td>
                          <td className="font-medium text-xs truncate max-w-[100px]">
                            {m.teamName}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span
                              className={`badge badge-sm font-bold tabular-nums ${
                                m.result === "W"
                                  ? "badge-success text-white"
                                  : m.result === "L"
                                  ? "badge-error text-white"
                                  : "badge-ghost"
                              }`}
                            >
                              {m.teamScore}:{m.opponentScore}
                            </span>
                          </td>
                          <td className="font-medium text-xs truncate max-w-[100px]">
                            {m.opponentName}
                          </td>
                          <td className="text-right font-bold text-primary tabular-nums">
                            {m.playerScore}
                          </td>
                          <td className="text-right font-bold text-info tabular-nums">
                            {m.playerBlowjobs > 0 ? m.playerBlowjobs : "—"}
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
