"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Trophy, List } from "lucide-react";
import { renderRank, getPodiumRowStyle } from "@/lib/podium";
import { PlayerDetailModal } from "@/components/PlayerDetailModal";

export interface LeaderboardPlayer {
  playerId: number;
  playerName: string;
  totalScore?: number;
  totalBlowjobs?: number;
  matchesPlayed?: number;
}

interface LeaderboardCardProps {
  title: string;
  subtitle?: string;
  players: LeaderboardPlayer[];
  type: "score" | "blowjob";
  previewLimit?: number;
  valueColumnTitle?: string;
  emptyText?: string;
  variant?: "admin" | "public";
}

export function LeaderboardCard({
  title,
  subtitle,
  players = [],
  type,
  previewLimit = 5,
  valueColumnTitle,
  emptyText = "Žádná individuální data.",
  variant = "admin",
}: LeaderboardCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailPlayerId, setDetailPlayerId] = useState<number | null>(null);

  const defaultColTitle =
    valueColumnTitle || (type === "score" ? "Kelímky" : "Vyfouknuto");

  const previewPlayers = players.slice(0, previewLimit);

  const getValue = (p: LeaderboardPlayer) =>
    type === "score" ? p.totalScore ?? 0 : p.totalBlowjobs ?? 0;

  const valueColorClass =
    type === "score" ? "text-primary" : "text-info";

  // Vyhledávání v plném dialogu
  const filteredPlayers = players.map((p, originalIdx) => ({
    ...p,
    rank: originalIdx + 1,
  })).filter((p) =>
    p.playerName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div
      className={`card bg-base-100 ${
        variant === "public"
          ? "w-full shadow-lg border border-base-200"
          : "shadow-md border border-base-200"
      }`}
    >
      <div className="card-body p-3.5 sm:p-6">
        <div className={variant === "public" ? "text-center mb-3" : "mb-3"}>
          <h3
            className={`font-bold ${
              variant === "public"
                ? "text-base sm:text-xl"
                : "text-base"
            }`}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-base-content/60 mt-0.5">{subtitle}</p>
          )}
        </div>

        {players.length === 0 ? (
          <p className="text-base-content/60 italic py-4 text-center text-xs">
            {emptyText}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-12 text-center px-1 sm:px-2">Poř.</th>
                    <th className="px-2">Hráč</th>
                    <th className="text-right px-2">{defaultColTitle}</th>
                  </tr>
                </thead>
                <tbody>
                  {previewPlayers.map((p, idx) => (
                    <tr
                      key={p.playerId}
                      className={getPodiumRowStyle(idx)}
                    >
                      <td className="w-12 text-center px-1 sm:px-2 tabular-nums">
                        {renderRank(idx)}
                      </td>
                      <td className="font-semibold px-2">
                        <button
                          type="button"
                          onClick={() => setDetailPlayerId(p.playerId)}
                          className="text-left hover:text-primary transition-colors underline-offset-2 hover:underline"
                          title="Zobrazit profil a statistiky hráče"
                        >
                          {p.playerName}
                        </button>
                      </td>
                      <td
                        className={`text-right px-2 font-bold tabular-nums ${valueColorClass}`}
                      >
                        {getValue(p)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {players.length > previewLimit && (
              <div className="mt-3 pt-2 border-t border-base-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsDialogOpen(true);
                  }}
                  className="btn btn-outline btn-sm w-full text-xs gap-1.5 font-medium hover:bg-base-200"
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Zobrazit celý žebříček ({players.length} hráčů)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog s kompletním žebříčkem všech hráčů */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[88vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              <span>{title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-base-content/70">
              Kompletní pořadí všech {players.length} hráčů podle {subtitle ? subtitle.toLowerCase() : "výsledků"}.
            </DialogDescription>
          </DialogHeader>

          {/* Vyhledávací lišta */}
          <div className="relative my-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vyhledat hráče..."
              className="input input-sm input-bordered w-full pl-9 pr-3 text-xs sm:text-sm"
              autoFocus={false}
            />
          </div>

          {/* Tabulka všech hráčů */}
          <div className="overflow-y-auto max-h-[55vh] border border-base-200 rounded-lg">
            <table className="table table-sm table-pin-rows w-full">
              <thead>
                <tr className="bg-base-200 text-xs">
                  <th className="w-14 text-center">Poř.</th>
                  <th>Hráč</th>
                  <th className="text-center hidden sm:table-cell">Zápasy</th>
                  <th className="text-right">{defaultColTitle}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-xs text-base-content/60 italic"
                    >
                      Nenalezen žádný hráč odpovídající dotazu „{searchQuery}“.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => {
                    return (
                      <tr
                        key={p.playerId}
                        className={getPodiumRowStyle(p.rank - 1)}
                      >
                        <td className="w-12 text-center tabular-nums">
                          {renderRank(p.rank - 1)}
                        </td>
                        <td className="font-semibold text-xs sm:text-sm">
                          <button
                            type="button"
                            onClick={() => setDetailPlayerId(p.playerId)}
                            className="text-left hover:text-primary transition-colors underline-offset-2 hover:underline"
                            title="Zobrazit profil a statistiky hráče"
                          >
                            {p.playerName}
                          </button>
                        </td>
                        <td className="text-center text-xs tabular-nums hidden sm:table-cell text-base-content/70">
                          {p.matchesPlayed !== undefined ? p.matchesPlayed : "—"}
                        </td>
                        <td
                          className={`text-right font-bold tabular-nums text-sm ${valueColorClass}`}
                        >
                          {getValue(p)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-base-200 text-xs text-base-content/60">
            <span>
              Zobrazeno {filteredPlayers.length} z {players.length} hráčů
            </span>
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="btn btn-sm btn-ghost text-xs"
            >
              Zavřít
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail hráče */}
      <PlayerDetailModal
        playerId={detailPlayerId}
        isOpen={Boolean(detailPlayerId)}
        onOpenChange={(open) => !open && setDetailPlayerId(null)}
      />
    </div>
  );
}
