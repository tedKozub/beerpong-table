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

interface ScheduleSectionProps {
  roundId: number;
  roundName: string;
  schedule: ScheduledMatchWithResult[];
  isAdmin?: boolean;
}

export function ScheduleSection({
  roundId,
  roundName,
  schedule,
  isAdmin = false,
}: ScheduleSectionProps) {
  const [downloading, setDownloading] = useState<"pdf" | "slides" | null>(null);
  const [tablesCount, setTablesCount] = useState("2");
  const [generating, setGenerating] = useState(false);

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

  // Group by match wave / round
  const waves = new Map<number, ScheduledMatchWithResult[]>();
  for (const m of schedule) {
    waves.set(m.round, [...(waves.get(m.round) ?? []), m]);
  }
  const playedCount = schedule.filter((m) => m.score !== null).length;

  if (schedule.length === 0) {
    if (!isAdmin) return null;

    return (
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-5 sm:p-6">
          <h2 className="text-xl font-bold">Rozpis zápasů na stoly</h2>
          <p className="text-sm text-base-content/70">
            Pro tento večer zatím nebyl vygenerován rozpis zápasů na stoly (Round-Robin).
          </p>
          <form onSubmit={handleGenerate} className="flex flex-wrap items-center gap-3 mt-3">
            <label className="text-sm font-medium">Počet stolů:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={tablesCount}
              onChange={(e) => setTablesCount(e.target.value)}
              className="input input-bordered input-sm w-20 text-center font-bold tabular-nums"
              required
            />
            <button
              type="submit"
              disabled={generating}
              className="btn btn-primary btn-sm"
            >
              {generating ? "Generuji..." : "Vygenerovat rozpis"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200 pb-4">
          <div>
            <h2 className="text-xl font-bold">Rozpis zápasů na stoly</h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Odehráno <span className="tabular-nums font-semibold">{playedCount}</span> z{" "}
              <span className="tabular-nums font-semibold">{schedule.length}</span> naplánovaných zápasů
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        {/* Waves grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {Array.from(waves.entries()).map(([waveNumber, matches]) => (
            <div
              key={waveNumber}
              className="bg-base-200/60 rounded-xl border border-base-300 p-4 flex flex-col gap-2"
            >
              <h3 className="font-bold text-sm text-base-content/80 flex justify-between items-center">
                <span>Vlna zápasů #{waveNumber}</span>
                <span className="badge badge-sm badge-ghost text-xs tabular-nums">
                  {matches.filter((m) => m.score !== null).length}/{matches.length}
                </span>
              </h3>

              <div className="divide-y divide-base-300/80 text-xs">
                {matches.map((m) => (
                  <div
                    key={`${m.tableNumber}-${m.team1Id}`}
                    className="py-2 flex items-center justify-between gap-2"
                  >
                    <span className="text-base-content/60 font-medium shrink-0">
                      Stůl {m.tableNumber}
                    </span>
                    <span className="font-semibold text-right flex-1 truncate">
                      {m.team1Name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-base-100 font-bold tabular-nums shrink-0 border border-base-300">
                      {m.score ?? "vs"}
                    </span>
                    <span className="font-semibold text-left flex-1 truncate">
                      {m.team2Name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
