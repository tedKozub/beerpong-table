"use client";
import { deleteSchedule, ScheduledMatchWithResult } from "@/actions/schedule";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  downloadSchedulePdf,
  downloadScheduleSlidesPdf,
} from "@/lib/schedulePdf";
import Link from "next/link";
import { ReactNode, useState } from "react";
import SharePublicLink from "@/components/SharePublicLink";
import { ScheduleGenerateForm } from "./scheduleGenerateForm";

type Props = {
  tournamentId: number;
  tournamentName: string;
  isOutdated: boolean;
  schedule: ScheduledMatchWithResult[];
  // rendered between the schedule and its settings, e.g. played matches
  children?: ReactNode;
};

const scoreInputHref = (tournamentId: number, m: ScheduledMatchWithResult) =>
  `/${tournamentId}/new?team1=${m.team1Id}&team2=${m.team2Id}`;

// a match from the current round, large enough to tap at the table
const CurrentMatchCard = ({
  tournamentId,
  match,
}: {
  tournamentId: number;
  match: ScheduledMatchWithResult;
}) => {
  const content = (
    <>
      <div className="text-xs font-semibold text-base-content/60 mb-2">Stůl {match.tableNumber}</div>
      <div className="flex items-center justify-between gap-3 text-lg font-bold text-base-content">
        <span className="flex-1 text-right">{match.team1Name}</span>
        <span
          className={
            match.score ? "text-success font-black text-nowrap" : "text-base-content/50 text-sm font-medium"
          }
        >
          {match.score ?? "vs"}
        </span>
        <span className="flex-1">{match.team2Name}</span>
      </div>
      <div className="mt-3 text-sm text-center">
        {match.score ? (
          <span className="text-success font-semibold">Odehráno</span>
        ) : (
          <span className="text-primary font-bold">Zadat výsledek →</span>
        )}
      </div>
    </>
  );

  if (match.score) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100/60 p-5 opacity-70">
        {content}
      </div>
    );
  }
  return (
    <Link
      href={scoreInputHref(tournamentId, match)}
      className="block rounded-xl border-2 border-primary bg-base-100 p-5 hover:bg-base-200/60 transition-all shadow-sm"
    >
      {content}
    </Link>
  );
};

export const ScheduleMain = ({
  tournamentId,
  tournamentName,
  isOutdated,
  schedule,
  children,
}: Props) => {
  const [downloading, setDownloading] = useState<"pdf" | "slides" | null>(null);

  const rounds = new Map<number, ScheduledMatchWithResult[]>();
  for (const m of schedule) {
    rounds.set(m.round, [...(rounds.get(m.round) ?? []), m]);
  }
  const playedCount = schedule.filter((m) => m.score).length;
  // the active round is the first one with a match still to play
  const currentRound = schedule.find((m) => !m.score)?.round ?? null;
  const roundNumbers = Array.from(rounds.keys());
  const nextRound =
    currentRound === null
      ? null
      : (roundNumbers.find((r) => r > currentRound) ?? null);
  const usedTables = Math.max(1, ...schedule.map((m) => m.tableNumber));

  const handleDownload = async (kind: "pdf" | "slides") => {
    setDownloading(kind);
    try {
      const download =
        kind === "pdf" ? downloadSchedulePdf : downloadScheduleSlidesPdf;
      await download(tournamentName, schedule);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="border-b border-base-300 bg-base-100/50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-base-content">{tournamentName}</h1>
            <p className="text-base-content/70 mt-1 text-sm font-medium">
              Odehráno {playedCount} z {schedule.length} zápasů
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SharePublicLink tournamentId={tournamentId} />
            <Link href={`/${tournamentId}/stats`} className="btn btn-secondary">
              Statistiky turnaje
            </Link>
            <button
              className="btn btn-secondary"
              disabled={downloading !== null}
              onClick={() => handleDownload("pdf")}
            >
              {downloading === "pdf" ? "Připravuji PDF..." : "Stáhnout PDF"}
            </button>
            <button
              className="btn btn-secondary"
              disabled={downloading !== null}
              onClick={() => handleDownload("slides")}
            >
              {downloading === "slides"
                ? "Připravuji prezentaci..."
                : "Prezentace 16:9"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-10">
        {isOutdated && (
          <div className="alert alert-warning">
            <span>Rozpis neodpovídá aktuálním týmům v turnaji. Přegeneruj ho.</span>
          </div>
        )}

        {currentRound === null ? (
          <div className="alert alert-success justify-center text-center p-6 flex flex-col items-center">
            <h2 className="text-2xl font-black">
              Všechny zápasy odehrány
            </h2>
            <Link
              href={`/${tournamentId}/stats`}
              className="btn btn-primary mt-4 font-bold"
            >
              Zobrazit výsledky
            </Link>
          </div>
        ) : (
          <section>
            <h2 className="text-2xl font-black tracking-tight mb-4 text-base-content">
              Aktuální kolo {currentRound}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rounds.get(currentRound)!.map((m) => (
                <CurrentMatchCard
                  key={m.tableNumber}
                  tournamentId={tournamentId}
                  match={m}
                />
              ))}
            </div>
            {nextRound !== null && (
              <p className="mt-4 text-sm text-base-content/70">
                <span className="font-semibold text-base-content">
                  Další kolo {nextRound}:
                </span>{" "}
                {rounds
                  .get(nextRound)!
                  .map(
                    (m) =>
                      `Stůl ${m.tableNumber}: ${m.team1Name} vs ${m.team2Name}`
                  )
                  .join(" · ")}
              </p>
            )}
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4 text-base-content">Celý rozpis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from(rounds, ([round, matches]) => (
              <div
                key={round}
                className={`card bg-base-100 rounded-xl border p-4 shadow-sm ${
                  round === currentRound
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-base-300"
                } ${matches.every((m) => m.score) ? "opacity-60" : ""}`}
              >
                <h3 className="text-lg font-bold mb-3 text-base-content">
                  Kolo {round}
                  {round === currentRound && (
                    <span className="ml-2 text-xs font-semibold text-primary badge badge-primary badge-outline">
                      právě se hraje
                    </span>
                  )}
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {matches.map((m) => (
                      <tr
                        key={m.tableNumber}
                        className="border-t border-base-300"
                      >
                        <td className="py-2 pr-2 text-base-content/60 text-xs font-medium text-nowrap">
                          Stůl {m.tableNumber}
                        </td>
                        <td className="py-2 text-right font-medium text-base-content">{m.team1Name}</td>
                        <td className="py-2 px-2 text-center text-nowrap">
                          {m.score ? (
                            <span className="text-success font-bold">{m.score}</span>
                          ) : (
                            <Link
                              href={scoreInputHref(tournamentId, m)}
                              className="text-primary font-semibold hover:underline"
                            >
                              zadat
                            </Link>
                          )}
                        </td>
                        <td className="py-2 font-medium text-base-content">{m.team2Name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {children}

        <section className="border-t border-base-300 pt-6">
          <h2 className="text-lg font-bold mb-4 text-base-content">Nastavení rozpisu</h2>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <ScheduleGenerateForm
              tournamentId={tournamentId}
              defaultTables={usedTables}
              hasSchedule
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="btn btn-ghost">Upravit týmy</button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-base-100 border border-base-300 text-base-content">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-bold text-base-content">
                    Zpět k nastavení turnaje?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base-content/70">
                    Rozpis bude smazán, abys mohl upravit týmy. Odehrané zápasy
                    zůstanou zachovány. Po úpravě rozpis znovu vygeneruj.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="btn btn-secondary">
                    Zrušit
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteSchedule(tournamentId)}
                  >
                    Smazat rozpis
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </div>
  );
};
