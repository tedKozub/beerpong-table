"use client";

import {
  getMatchDetailsForTeams,
  saveOrUpdateMatchScore,
} from "@/actions/matches";
import { ArrowUpDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PlayerOption {
  id: number;
  name: string;
}

interface ScoreInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: number;
  team1: { id: number; name: string };
  team2: { id: number; name: string };
  tableNumber: number;
  roster: {
    id: number;
    roundId: number;
    teamId: number;
    playerId: number;
    playerName: string;
  }[];
  allSeasonPlayers: PlayerOption[];
  existingScore?: string | null;
}

export function ScoreInputDialog({
  isOpen,
  onClose,
  roundId,
  team1,
  team2,
  tableNumber,
  roster,
  allSeasonPlayers,
  existingScore,
}: ScoreInputDialogProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Získáme hráče zapsané na soupisce daného kola pro team1 a team2
  const team1Roster = roster.filter((r) => r.teamId === team1.id);
  const team2Roster = roster.filter((r) => r.teamId === team2.id);

  const [t1p1, setT1p1] = useState<PlayerOption | null>(null);
  const [t1p2, setT1p2] = useState<PlayerOption | null>(null);
  const [t2p1, setT2p1] = useState<PlayerOption | null>(null);
  const [t2p2, setT2p2] = useState<PlayerOption | null>(null);

  const [t1p1Score, setT1p1Score] = useState<string>("0");
  const [t1p1Bj, setT1p1Bj] = useState<string>("0");
  const [t1p2Score, setT1p2Score] = useState<string>("0");
  const [t1p2Bj, setT1p2Bj] = useState<string>("0");

  const [t2p1Score, setT2p1Score] = useState<string>("0");
  const [t2p1Bj, setT2p1Bj] = useState<string>("0");
  const [t2p2Score, setT2p2Score] = useState<string>("0");
  const [t2p2Bj, setT2p2Bj] = useState<string>("0");

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    // Inicializace výchozích hráčů z aktuální soupisky večera
    const p1_1 = team1Roster[0]
      ? { id: team1Roster[0].playerId, name: team1Roster[0].playerName }
      : allSeasonPlayers[0] || null;
    const p1_2 = team1Roster[1]
      ? { id: team1Roster[1].playerId, name: team1Roster[1].playerName }
      : allSeasonPlayers.find((p) => p.id !== p1_1?.id) || null;

    setT1p1(p1_1);
    setT1p2(p1_2);

    const p2_1 = team2Roster[0]
      ? { id: team2Roster[0].playerId, name: team2Roster[0].playerName }
      : allSeasonPlayers.find((p) => p.id !== p1_1?.id && p.id !== p1_2?.id) || null;
    const p2_2 = team2Roster[1]
      ? { id: team2Roster[1].playerId, name: team2Roster[1].playerName }
      : allSeasonPlayers.find(
          (p) => p.id !== p1_1?.id && p.id !== p1_2?.id && p.id !== p2_1?.id
        ) || null;

    setT2p1(p2_1);
    setT2p2(p2_2);

    // Výchozí hodnoty pro nový zápas
    setT1p1Score("0");
    setT1p1Bj("0");
    setT1p2Score("0");
    setT1p2Bj("0");
    setT2p1Score("0");
    setT2p1Bj("0");
    setT2p2Score("0");
    setT2p2Bj("0");

    // Pokud už byl zápas odehrán, načteme přesné detaily z DB
    if (existingScore) {
      getMatchDetailsForTeams(roundId, team1.id, team2.id).then((details) => {
        if (isCancelled || !details) return;
        const { scores } = details;
        const t1Scores = scores.filter((s) => s.teamId === team1.id);
        const t2Scores = scores.filter((s) => s.teamId === team2.id);

        if (t1Scores[0]) {
          setT1p1({ id: t1Scores[0].playerId, name: t1Scores[0].playerName });
          setT1p1Score(String(t1Scores[0].score));
          setT1p1Bj(String(t1Scores[0].blowjobs));
        }
        if (t1Scores[1]) {
          setT1p2({ id: t1Scores[1].playerId, name: t1Scores[1].playerName });
          setT1p2Score(String(t1Scores[1].score));
          setT1p2Bj(String(t1Scores[1].blowjobs));
        }
        if (t2Scores[0]) {
          setT2p1({ id: t2Scores[0].playerId, name: t2Scores[0].playerName });
          setT2p1Score(String(t2Scores[0].score));
          setT2p1Bj(String(t2Scores[0].blowjobs));
        }
        if (t2Scores[1]) {
          setT2p2({ id: t2Scores[1].playerId, name: t2Scores[1].playerName });
          setT2p2Score(String(t2Scores[1].score));
          setT2p2Bj(String(t2Scores[1].blowjobs));
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, team1.id, team2.id, roundId, existingScore]);

  if (!isOpen) return null;

  const swapTeam1 = () => {
    const tmpP = t1p1;
    setT1p1(t1p2);
    setT1p2(tmpP);
    const tmpS = t1p1Score;
    setT1p1Score(t1p2Score);
    setT1p2Score(tmpS);
    const tmpB = t1p1Bj;
    setT1p1Bj(t1p2Bj);
    setT1p2Bj(tmpB);
  };

  const swapTeam2 = () => {
    const tmpP = t2p1;
    setT2p1(t2p2);
    setT2p2(tmpP);
    const tmpS = t2p1Score;
    setT2p1Score(t2p2Score);
    setT2p2Score(tmpS);
    const tmpB = t2p1Bj;
    setT2p1Bj(t2p2Bj);
    setT2p2Bj(tmpB);
  };

  const team1Total = (Number(t1p1Score) || 0) + (Number(t1p2Score) || 0);
  const team2Total = (Number(t2p1Score) || 0) + (Number(t2p2Score) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const playerScoresData: {
        playerId: number;
        teamId: number;
        score: number;
        blowjobs: number;
      }[] = [];

      if (t1p1) {
        playerScoresData.push({
          playerId: t1p1.id,
          teamId: team1.id,
          score: Number(t1p1Score) || 0,
          blowjobs: Number(t1p1Bj) || 0,
        });
      }
      if (t1p2) {
        playerScoresData.push({
          playerId: t1p2.id,
          teamId: team1.id,
          score: Number(t1p2Score) || 0,
          blowjobs: Number(t1p2Bj) || 0,
        });
      }
      if (t2p1) {
        playerScoresData.push({
          playerId: t2p1.id,
          teamId: team2.id,
          score: Number(t2p1Score) || 0,
          blowjobs: Number(t2p1Bj) || 0,
        });
      }
      if (t2p2) {
        playerScoresData.push({
          playerId: t2p2.id,
          teamId: team2.id,
          score: Number(t2p2Score) || 0,
          blowjobs: Number(t2p2Bj) || 0,
        });
      }

      await saveOrUpdateMatchScore({
        roundId,
        team1Id: team1.id,
        team2Id: team2.id,
        team1Score: team1Total,
        team2Score: team2Total,
        playerScores: playerScoresData,
      });

      onClose();
      router.refresh();
    } catch (err) {
      console.error("Chyba při ukládání zápasu:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="fixed inset-0 z-0"
        onClick={onClose}
        aria-label="Zavřít"
      />
      <div className="relative z-10 max-w-2xl w-full bg-base-100 text-base-content border border-base-300 p-5 sm:p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <span className="badge badge-neutral text-xs font-bold tabular-nums">
            Stůl {tableNumber}
          </span>
          <h2 className="text-xl font-bold mt-1">Zápis výsledku zápasu</h2>
          <p className="text-xs text-base-content/60">
            Zadej body (trefené kelímky) a vyfouknuté kelímky (blowjoby) pro jednotlivé hráče
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="overflow-x-auto border border-base-300 rounded-xl">
            <table className="table table-sm w-full text-center">
              <thead className="bg-base-200">
                <tr>
                  <th colSpan={2} className="py-2.5 px-3 border-b border-base-300">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-base-content truncate">
                        {team1.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost gap-1"
                        title="Prohodit pořadí hráčů"
                        onClick={swapTeam1}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                  <th
                    colSpan={2}
                    className="py-2.5 px-2 border-b border-base-300 text-center font-bold text-sm"
                  >
                    Skóre
                  </th>
                  <th colSpan={2} className="py-2.5 px-3 border-b border-base-300">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-base-content truncate">
                        {team2.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost gap-1"
                        title="Prohodit pořadí hráčů"
                        onClick={swapTeam2}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Hlavička sloupců pro Hráč 1 */}
                <tr className="text-xs text-base-content/60 bg-base-200/40">
                  <td className="py-1 px-3 text-left font-medium">Hráč 1</td>
                  <td className="py-1 px-2 text-center font-medium">BJ</td>
                  <td colSpan={2} className="py-1 px-2 text-center font-bold">
                    Body
                  </td>
                  <td className="py-1 px-2 text-center font-medium">BJ</td>
                  <td className="py-1 px-3 text-right font-medium">Hráč 1</td>
                </tr>
                <tr>
                  {/* Hráč 1 Tým 1 */}
                  <td className="py-2 px-3 text-left">
                    <select
                      className="select select-bordered select-xs w-full max-w-[140px] font-semibold"
                      value={t1p1?.id ?? ""}
                      onChange={(e) => {
                        const found = allSeasonPlayers.find(
                          (p) => p.id === Number(e.target.value)
                        );
                        if (found) setT1p1(found);
                      }}
                    >
                      {allSeasonPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t1p1Bj}
                      onChange={(e) => setT1p1Bj(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-14 text-center font-bold tabular-nums"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t1p1Score}
                      onChange={(e) => setT1p1Score(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-16 text-center font-bold tabular-nums text-primary"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t2p1Score}
                      onChange={(e) => setT2p1Score(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-16 text-center font-bold tabular-nums text-primary"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t2p1Bj}
                      onChange={(e) => setT2p1Bj(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-14 text-center font-bold tabular-nums"
                    />
                  </td>
                  {/* Hráč 1 Tým 2 */}
                  <td className="py-2 px-3 text-right">
                    <select
                      className="select select-bordered select-xs w-full max-w-[140px] font-semibold"
                      value={t2p1?.id ?? ""}
                      onChange={(e) => {
                        const found = allSeasonPlayers.find(
                          (p) => p.id === Number(e.target.value)
                        );
                        if (found) setT2p1(found);
                      }}
                    >
                      {allSeasonPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* Hlavička sloupců pro Hráč 2 */}
                <tr className="text-xs text-base-content/60 bg-base-200/40">
                  <td className="py-1 px-3 text-left font-medium">Hráč 2</td>
                  <td className="py-1 px-2 text-center font-medium">BJ</td>
                  <td colSpan={2} className="py-1 px-2 text-center font-bold">
                    Body
                  </td>
                  <td className="py-1 px-2 text-center font-medium">BJ</td>
                  <td className="py-1 px-3 text-right font-medium">Hráč 2</td>
                </tr>
                <tr>
                  {/* Hráč 2 Tým 1 */}
                  <td className="py-2 px-3 text-left">
                    <select
                      className="select select-bordered select-xs w-full max-w-[140px] font-semibold"
                      value={t1p2?.id ?? ""}
                      onChange={(e) => {
                        const found = allSeasonPlayers.find(
                          (p) => p.id === Number(e.target.value)
                        );
                        if (found) setT1p2(found);
                      }}
                    >
                      {allSeasonPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t1p2Bj}
                      onChange={(e) => setT1p2Bj(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-14 text-center font-bold tabular-nums"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t1p2Score}
                      onChange={(e) => setT1p2Score(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-16 text-center font-bold tabular-nums text-primary"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t2p2Score}
                      onChange={(e) => setT2p2Score(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-16 text-center font-bold tabular-nums text-primary"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t2p2Bj}
                      onChange={(e) => setT2p2Bj(e.target.value)}
                      placeholder="0"
                      className="input input-bordered input-xs sm:input-sm w-14 text-center font-bold tabular-nums"
                    />
                  </td>
                  {/* Hráč 2 Tým 2 */}
                  <td className="py-2 px-3 text-right">
                    <select
                      className="select select-bordered select-xs w-full max-w-[140px] font-semibold"
                      value={t2p2?.id ?? ""}
                      onChange={(e) => {
                        const found = allSeasonPlayers.find(
                          (p) => p.id === Number(e.target.value)
                        );
                        if (found) setT2p2(found);
                      }}
                    >
                      {allSeasonPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Celkové skóre týmů */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-base-200 border border-base-300">
            <div className="font-bold text-sm sm:text-base truncate flex-1">
              {team1.name}
            </div>
            <div className="text-2xl font-black text-primary tabular-nums px-4 shrink-0">
              {team1Total} : {team2Total}
            </div>
            <div className="font-bold text-sm sm:text-base text-right truncate flex-1">
              {team2.name}
            </div>
          </div>

          <div className="modal-action mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              disabled={saving}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? "Ukládám..." : "Uložit výsledek zápasu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
