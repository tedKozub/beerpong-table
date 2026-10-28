"use client";

import {
  createScheduleForRound,
  deleteScheduleForRound,
  ScheduledMatchWithResult,
} from "@/actions/schedule";
import {
  downloadSchedulePdf,
  downloadScheduleSlidesPdf,
} from "@/lib/schedulePdf";
import { useState } from "react";
import { ScoreInputDialog } from "./ScoreInputDialog";

interface PlayerOption {
  id: number;
  name: string;
}

interface ScheduleSectionProps {
  roundId: number;
  roundName: string;
  schedule: ScheduledMatchWithResult[];
  roster?: {
    id: number;
    roundId: number;
    teamId: number;
    playerId: number;
    playerName: string;
  }[];
  allSeasonPlayers?: PlayerOption[];
  isAdmin?: boolean;
}

export function ScheduleSection({
  roundId,
  roundName,
  schedule,
  roster = [],
  allSeasonPlayers = [],
  isAdmin = false,
}: ScheduleSectionProps) {
  const [downloading, setDownloading] = useState<"pdf" | "slides" | null>(null);
  const [tablesCount, setTablesCount] = useState("2");
  const [generating, setGenerating] = useState(false);

  // Dialog state for entering/editing score for a match
  const [selectedMatch, setSelectedMatch] =
    useState<ScheduledMatchWithResult | null>(null);

  const handleDownload = async (kind: "pdf" | "slides") => {
    setDownloading(kind);
    try {
      const download =
        kind === "pdf" ? downloadSchedulePdf : downloadScheduleSlidesPdf;
      await download(roundName, schedule);
    } catch (e) {
      console.error("Chyba při stahování PDF:", e);
    } finally {
      setDownloading(null);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await createScheduleForRound(roundId, Number(tablesCount));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Opravdu chceš smazat rozpis stolů pro toto kolo?")) {
      await deleteScheduleForRound(roundId);
    }
  };

  // Group by match wave
  const waves = new Map<number, ScheduledMatchWithResult[]>();
  for (const m of schedule) {
    waves.set(m.round, [...(waves.get(m.round) ?? []), m]);
  }
  const playedCount = schedule.filter((m) => m.score !== null).length;

  // The active wave is the first one with a match still to play (srihak logic)
  const currentWave = schedule.find((m) => !m.score)?.round ?? null;
  const waveNumbers = Array.from(waves.keys());
  const nextWave =
    currentWave === null
      ? null
      : waveNumbers.find((w) => w > currentWave) ?? null;

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      {/* Horní lišta rozpisu s akcemi */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full min-w-0">
            <div>
              <h2 className="text-xl font-bold">Rozpis zápasů na stoly</h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                Odehráno <span className="tabular-nums font-semibold">{playedCount}</span> z{" "}
                <span className="tabular-nums font-semibold">{schedule.length}</span> naplánovaných zápasů
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                className="btn btn-outline btn-sm text-xs"
                disabled={downloading !== null}
                onClick={() => handleDownload("pdf")}
              >
                {downloading === "pdf" ? "Generuji PDF..." : "Stáhnout PDF (A4)"}
              </button>
              <button
                className="btn btn-outline btn-sm text-xs"
                disabled={downloading !== null}
                onClick={() => handleDownload("slides")}
              >
                {downloading === "slides" ? "Generuji 16:9..." : "Prezentace (16:9)"}
              </button>
              {isAdmin && (
                <button
                  className="btn btn-ghost btn-sm text-xs text-error hover:bg-error/10"
                  onClick={handleDelete}
                >
                  Smazat rozpis
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Aktuální vlna zápasů (srihak styl) */}
      {currentWave !== null && waves.has(currentWave) && (
        <section className="card bg-base-100 shadow-md border-2 border-primary/40 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-4">
            <div>
              <span className="badge badge-primary badge-sm font-bold uppercase text-[10px]">
                Právě se hraje
              </span>
              <h3 className="text-xl font-black mt-1">
                Aktuální vlna zápasů #{currentWave}
              </h3>
            </div>
            <span className="text-xs text-base-content/60 font-semibold">
              Kliknutím na zápas otevřeš zadání bodů
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waves.get(currentWave)!.map((m) => {
              const isPlayed = m.score !== null;
              return (
                <div
                  key={`cur-${m.tableNumber}-${m.team1Id}`}
                  onClick={() => {
                    if (isAdmin) setSelectedMatch(m);
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    isAdmin ? "cursor-pointer" : ""
                  } ${
                    isPlayed
                      ? "bg-base-200/50 border-base-300 opacity-80 hover:opacity-100"
                      : "bg-base-100 border-primary/50 shadow-md hover:border-primary hover:shadow-lg"
                  }`}
                >
                  <div className="text-xs text-base-content/60 font-semibold mb-2">
                    Stůl {m.tableNumber}
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:gap-3 text-base font-bold min-w-0">
                    <span className="flex-1 text-right min-w-0 truncate">
                      {m.team1Name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-sm tabular-nums shrink-0 whitespace-nowrap ${
                        isPlayed
                          ? "bg-success/20 text-success-content font-black"
                          : "bg-base-200 text-base-content/60 font-medium"
                      }`}
                    >
                      {m.score ?? "vs"}
                    </span>
                    <span className="flex-1 text-left min-w-0 truncate">
                      {m.team2Name}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="mt-3 text-center">
                      {isPlayed ? (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-base-200">
                          <span className="text-xs text-success font-semibold">
                            Odehráno
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMatch(m);
                            }}
                            className="btn btn-xs btn-outline"
                          >
                            Upravit
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatch(m);
                          }}
                          className="btn btn-sm btn-primary w-full font-bold shadow"
                        >
                          Vyplnit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {nextWave !== null && waves.has(nextWave) && (
            <div className="mt-4 pt-3 border-t border-base-200 text-xs text-base-content/70 break-words">
              <span className="font-bold text-base-content">
                Další vlna zápasů #{nextWave}:
              </span>{" "}
              {waves
                .get(nextWave)!
                .map(
                  (m) => `Stůl ${m.tableNumber}: ${m.team1Name} vs ${m.team2Name}`
                )
                .join(" · ")}
            </div>
          )}
        </section>
      )}

      {/* Celý rozpis (všechny vlny přehledně) */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-3">Celý rozpis turnajového večera</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(waves.entries()).map(([waveNumber, matches]) => (
              <div
                key={waveNumber}
                className={`rounded-xl border p-4 flex flex-col gap-2 ${
                  waveNumber === currentWave
                    ? "bg-base-100 border-primary ring-1 ring-primary/40"
                    : "bg-base-200/50 border-base-300"
                } ${matches.every((m) => m.score !== null) ? "opacity-75" : ""}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm">
                    Vlna #{waveNumber}
                    {waveNumber === currentWave && (
                      <span className="ml-2 text-xs font-normal text-primary">
                        (právě probíhá)
                      </span>
                    )}
                  </h4>
                  <span className="badge badge-sm badge-ghost text-xs tabular-nums">
                    {matches.filter((m) => m.score !== null).length}/{matches.length}
                  </span>
                </div>

                <div className="divide-y divide-base-300 text-xs">
                  {matches.map((m) => {
                    const isPlayed = m.score !== null;
                    return (
                      <div
                        key={`all-${m.tableNumber}-${m.team1Id}`}
                        className="py-2 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0"
                      >
                        <span className="text-base-content/60 font-medium shrink-0 w-11 sm:w-14 text-xs">
                          Stůl {m.tableNumber}
                        </span>
                        <span className="font-semibold text-right flex-1 min-w-0 truncate">
                          {m.team1Name}
                        </span>
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 rounded tabular-nums font-bold shrink-0 text-center text-xs ${
                            isPlayed
                              ? "bg-success/20 text-success-content"
                              : "text-base-content/50"
                          }`}
                        >
                          {m.score ?? "vs"}
                        </span>
                        <span className="font-semibold text-left flex-1 min-w-0 truncate">
                          {m.team2Name}
                        </span>
                        {isAdmin && (
                          <div className="shrink-0 ml-1">
                            {isPlayed ? (
                              <button
                                type="button"
                                onClick={() => setSelectedMatch(m)}
                                className="btn btn-ghost btn-xs text-xs px-1.5"
                              >
                                Upravit
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedMatch(m)}
                                className="btn btn-primary btn-xs font-bold px-2"
                              >
                                Vyplnit
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dialog pro zadání bodů a blowjobů (otevře se po kliknutí na zápas) */}
      {selectedMatch && (
        <ScoreInputDialog
          isOpen={true}
          onClose={() => setSelectedMatch(null)}
          roundId={roundId}
          team1={{ id: selectedMatch.team1Id, name: selectedMatch.team1Name }}
          team2={{ id: selectedMatch.team2Id, name: selectedMatch.team2Name }}
          tableNumber={selectedMatch.tableNumber}
          roster={roster}
          allSeasonPlayers={allSeasonPlayers}
          existingScore={selectedMatch.score}
        />
      )}
    </div>
  );
}
