"use client";

import {
  addTeamWithPlayersToRound,
  removeTeamFromRound,
} from "@/actions/teams";
import {
  createScheduleForRound,
  deleteScheduleForRound,
} from "@/actions/schedule";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TeamOption {
  id: number;
  name: string;
}

interface PlayerOption {
  id: number;
  name: string;
}

interface RosterItem {
  id: number;
  roundId: number;
  teamId: number;
  playerId: number;
  playerName: string;
}

interface RoundSetupProps {
  roundId: number;
  seasonId: number;
  seasonTeams: TeamOption[];
  seasonPlayers: PlayerOption[];
  roster: RosterItem[];
  hasSchedule: boolean;
}

export function RoundSetup({
  roundId,
  seasonId,
  seasonTeams,
  seasonPlayers,
  roster,
  hasSchedule,
}: RoundSetupProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [teamName, setTeamName] = useState("");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [tablesCount, setTablesCount] = useState("2");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group roster by team
  const activeTeamsMap = new Map<
    number,
    { teamId: number; teamName: string; players: string[] }
  >();

  for (const r of roster) {
    if (!activeTeamsMap.has(r.teamId)) {
      const foundTeam = seasonTeams.find((t) => t.id === r.teamId);
      activeTeamsMap.set(r.teamId, {
        teamId: r.teamId,
        teamName: foundTeam ? foundTeam.name : `Tým #${r.teamId}`,
        players: [],
      });
    }
    activeTeamsMap.get(r.teamId)!.players.push(r.playerName);
  }

  const activeTeams = Array.from(activeTeamsMap.values());

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !player1Name.trim() || !player2Name.trim()) {
      setError("Vyplň prosím název týmu i oba hráče.");
      toast({
        title: "Chyba",
        description: "Vyplň prosím název týmu i oba hráče.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await addTeamWithPlayersToRound(roundId, seasonId, {
        teamName: teamName.trim(),
        player1Name: player1Name.trim(),
        player2Name: player2Name.trim(),
      });

      if (res.error) {
        setError(res.error);
        toast({
          title: "Chyba při přidávání týmu",
          description: res.error,
          variant: "destructive",
        });
      } else {
        const addedName = teamName.trim();
        setTeamName("");
        setPlayer1Name("");
        setPlayer2Name("");
        toast({
          title: "Tým přidán",
          description: `Tým ${addedName} byl úspěšně zařazen do tohoto kola.`,
        });
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Chyba při přidávání týmu");
      toast({
        title: "Chyba",
        description: err?.message || "Chyba při přidávání týmu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeam = async (teamId: number, name: string) => {
    if (!confirm(`Opravdu chceš odebrat tým ${name} z tohoto kola?`)) return;
    setLoading(true);
    try {
      await removeTeamFromRound(roundId, teamId);
      toast({
        title: "Tým odebrán",
        description: `Tým ${name} byl odebrán z kola.`,
      });
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Chyba při odebírání týmu");
      toast({
        title: "Chyba při odebírání týmu",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    const tables = parseInt(tablesCount);
    if (isNaN(tables) || tables < 1) {
      setError("Zadej platný počet stolů.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await createScheduleForRound(roundId, tables);
      if (res?.error) {
        setError(res.error);
        toast({
          title: "Chyba generování",
          description: res.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rozpis vygenerován",
          description: `Rozpis zápasů na ${tables} ${tables === 1 ? "stůl" : tables < 5 ? "stoly" : "stolů"} byl úspěšně vytvořen.`,
        });
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Chyba při generování rozpisu");
      toast({
        title: "Chyba při generování rozpisu",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSchedule = async () => {
    if (
      !confirm(
        "Opravdu chceš smazat vygenerovaný rozpis? Budou smazány i naplánované zápasy."
      )
    )
      return;

    setLoading(true);
    try {
      await deleteScheduleForRound(roundId);
      toast({
        title: "Rozpis smazán",
        description: "Rozpis zápasů byl smazán a je možné ho znovu nastavit.",
      });
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Chyba při resetování rozpisu");
      toast({
        title: "Chyba",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">
                Nastavení kola: Aktivní týmy a hráči
              </h2>
            </div>
            <p className="text-xs text-base-content/70 mt-1">
              Přiřaď týmy a jejich 2 hráče pro tento večer. Následně vygeneruj
              rozpis na stoly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-neutral text-xs tabular-nums">
              {activeTeams.length} aktivních týmů
            </span>
            {hasSchedule && (
              <span className="badge badge-success text-xs font-semibold">
                Rozpis aktivní
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-xs py-2 mt-3">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 w-full min-w-0">
          {/* 1. Formulář pro přidání týmu */}
          <div className="bg-base-200/50 p-4 rounded-xl border border-base-300 flex flex-col gap-3 min-w-0">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" />
              Přidat tým do tohoto kola
            </h3>
            <p className="text-xs text-base-content/60">
              Zadej název týmu a 2 hráče. Můžeš využít našeptávač ze semestru.
            </p>

            <form onSubmit={handleAddTeam} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="label label-text text-xs font-semibold py-1">
                  Název týmu
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Např. Pilsner Boys"
                  list="season-teams-list"
                  className="input input-bordered input-sm w-full"
                  required
                />
                <datalist id="season-teams-list">
                  {seasonTeams.map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label label-text text-xs font-semibold py-1">
                    Hráč 1
                  </label>
                  <input
                    type="text"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="Jméno prvního hráče"
                    list="season-players-list"
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>

                <div>
                  <label className="label label-text text-xs font-semibold py-1">
                    Hráč 2
                  </label>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="Jméno druhého hráče"
                    list="season-players-list"
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
              </div>

              <datalist id="season-players-list">
                {seasonPlayers.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      <span>Přidávám...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Přidat tým</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Seznam aktivních týmů v kole */}
          <div className="flex flex-col gap-2 min-w-0">
            <h3 className="font-bold text-sm">
              Týmy v tomto kole ({activeTeams.length})
            </h3>

            {activeTeams.length === 0 ? (
              <div className="p-6 text-center text-xs text-base-content/60 italic border border-dashed border-base-300 rounded-xl">
                Zatím v tomto kole nejsou žádné aktivní týmy. Přidej alespoň 2
                týmy vlevo pro možnost vygenerování rozpisu.
              </div>
            ) : (
              <div className="overflow-x-auto w-full border border-base-300 rounded-xl max-h-72 overflow-y-auto">
                <table className="table table-xs sm:table-sm w-full">
                  <thead className="bg-base-200 sticky top-0">
                    <tr>
                      <th>Tým</th>
                      <th>Hráč 1</th>
                      <th>Hráč 2</th>
                      <th className="w-12 text-center">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTeams.map((t) => (
                      <tr key={t.teamId} className="hover:bg-base-200/50">
                        <td className="font-bold">{t.teamName}</td>
                        <td>{t.players[0] || "-"}</td>
                        <td>{t.players[1] || "-"}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTeam(t.teamId, t.teamName)}
                            disabled={loading}
                            title="Odebrat tým z kola"
                            className="btn btn-ghost btn-xs text-error p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 3. Spodní lišta pro generování rozpisu */}
        <div className="mt-6 pt-4 border-t border-base-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <label className="text-xs font-semibold">Počet stolů pro rozpis:</label>
            <select
              value={tablesCount}
              onChange={(e) => setTablesCount(e.target.value)}
              className="select select-bordered select-xs w-20 tabular-nums"
              disabled={loading}
            >
              <option value="1">1 stůl</option>
              <option value="2">2 stoly</option>
              <option value="3">3 stoly</option>
              <option value="4">4 stoly</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {hasSchedule && (
              <button
                type="button"
                onClick={handleResetSchedule}
                disabled={loading}
                className="btn btn-ghost btn-xs text-error order-2 sm:order-1"
              >
                Smazat rozpis
              </button>
            )}

            <button
              type="button"
              onClick={handleGenerateSchedule}
              disabled={loading || activeTeams.length < 2}
              className="btn btn-primary btn-sm font-bold gap-1.5 order-1 sm:order-2 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Zpracovávám...</span>
                </>
              ) : hasSchedule ? (
                "Pře-generovat rozpis zápasů"
              ) : (
                "Vygenerovat rozpis zápasů na stoly"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
