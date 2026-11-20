"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createTeam, updateTeam, deleteTeam } from "@/actions/teams";
import { createPlayer, updatePlayer, deletePlayer } from "@/actions/players";
import { createRound, updateRound, deleteRound } from "@/actions/rounds";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { PlayerDetailModal } from "@/components/PlayerDetailModal";
import { TeamDetailModal } from "@/components/TeamDetailModal";
import {
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2,
  Calendar,
  Users,
  User,
} from "lucide-react";
import Link from "next/link";

interface TeamItem {
  id: number;
  name: string;
}

interface PlayerItem {
  id: number;
  name: string;
}

interface RoundItem {
  id: number;
  name: string;
  roundNumber: number;
  date: Date | null;
  isCompleted: boolean;
}

interface SeasonCrudManagerProps {
  seasonId: number;
  initialTeams: TeamItem[];
  initialPlayers: PlayerItem[];
  initialRounds: RoundItem[];
}

export function SeasonCrudManager({
  seasonId,
  initialTeams,
  initialPlayers,
  initialRounds,
}: SeasonCrudManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  // --- Team State ---
  const [newTeamName, setNewTeamName] = useState("");
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<TeamItem | null>(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [viewTeamId, setViewTeamId] = useState<number | null>(null);

  // --- Player State ---
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState("");
  const [isSavingPlayer, setIsSavingPlayer] = useState(false);
  const [deletingPlayer, setDeletingPlayer] = useState<PlayerItem | null>(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);
  const [viewPlayerId, setViewPlayerId] = useState<number | null>(null);

  // --- Round State ---
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundDate, setNewRoundDate] = useState("");
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);
  const [editingRoundName, setEditingRoundName] = useState("");
  const [editingRoundDate, setEditingRoundDate] = useState("");
  const [isSavingRound, setIsSavingRound] = useState(false);
  const [deletingRound, setDeletingRound] = useState<RoundItem | null>(null);
  const [isDeletingRound, setIsDeletingRound] = useState(false);

  // -------------------------------------------------------------
  // TEAM HANDLERS
  // -------------------------------------------------------------
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTeamName.trim();
    if (!trimmed) return;

    setIsAddingTeam(true);
    try {
      const res = await createTeam({ name: trimmed, seasonId });
      if (!res.success) {
        toast({
          title: "Chyba při vytváření týmu",
          description: res.error || "Tým se nepodařilo vytvořit.",
          variant: "destructive",
        });
        return;
      }
      setNewTeamName("");
      toast({
        title: "Tým vytvořen",
        description: `Tým „${trimmed}“ byl úspěšně přidán.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při vytváření týmu",
        description: err?.message || "Tým se nepodařilo vytvořit.",
        variant: "destructive",
      });
    } finally {
      setIsAddingTeam(false);
    }
  };

  const handleSaveTeamEdit = async (teamId: number) => {
    const trimmed = editingTeamName.trim();
    if (!trimmed) {
      toast({
        title: "Chyba",
        description: "Název týmu nesmí být prázdný.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTeam(true);
    try {
      const res = await updateTeam(teamId, { name: trimmed });
      if (!res.success) {
        toast({
          title: "Chyba při úpravě týmu",
          description: res.error || "Úprava se nezdařila.",
          variant: "destructive",
        });
        return;
      }
      setEditingTeamId(null);
      toast({
        title: "Tým přejmenován",
        description: `Název týmu byl upraven na „${trimmed}“.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při úpravě týmu",
        description: err?.message || "Úprava se nezdařila.",
        variant: "destructive",
      });
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleConfirmDeleteTeam = async () => {
    if (!deletingTeam) return;
    setIsDeletingTeam(true);
    try {
      const res = await deleteTeam(deletingTeam.id);
      if (!res.success) {
        toast({
          title: "Chyba při mazání týmu",
          description: res.error || "Smazání se nezdařilo.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Tým smazán",
        description: `Tým „${deletingTeam.name}“ byl smazán.`,
      });
      setDeletingTeam(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při mazání týmu",
        description: err?.message || "Smazání se nezdařilo.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTeam(false);
    }
  };

  // -------------------------------------------------------------
  // PLAYER HANDLERS
  // -------------------------------------------------------------
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    setIsAddingPlayer(true);
    try {
      const res = await createPlayer({ name: trimmed, seasonId });
      if (!res.success) {
        toast({
          title: "Chyba při registraci hráče",
          description: res.error || "Hráče se nepodařilo přidat.",
          variant: "destructive",
        });
        return;
      }
      setNewPlayerName("");
      toast({
        title: "Hráč registrován",
        description: `Hráč „${trimmed}“ byl úspěšně přidán.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při registraci hráče",
        description: err?.message || "Hráče se nepodařilo přidat.",
        variant: "destructive",
      });
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleSavePlayerEdit = async (playerId: number) => {
    const trimmed = editingPlayerName.trim();
    if (!trimmed) {
      toast({
        title: "Chyba",
        description: "Jméno hráče nesmí být prázdné.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPlayer(true);
    try {
      const res = await updatePlayer(playerId, { name: trimmed });
      if (!res.success) {
        toast({
          title: "Chyba při úpravě hráče",
          description: res.error || "Úprava se nezdařila.",
          variant: "destructive",
        });
        return;
      }
      setEditingPlayerId(null);
      toast({
        title: "Hráč upraven",
        description: `Jméno hráče bylo upraveno na „${trimmed}“.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při úpravě hráče",
        description: err?.message || "Úprava se nezdařila.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPlayer(false);
    }
  };

  const handleConfirmDeletePlayer = async () => {
    if (!deletingPlayer) return;
    setIsDeletingPlayer(true);
    try {
      const res = await deletePlayer(deletingPlayer.id);
      if (!res.success) {
        toast({
          title: "Chyba při mazání hráče",
          description: res.error || "Smazání se nezdařilo.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Hráč smazán",
        description: `Hráč „${deletingPlayer.name}“ byl smazán.`,
      });
      setDeletingPlayer(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při mazání hráče",
        description: err?.message || "Smazání se nezdařilo.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingPlayer(false);
    }
  };

  // -------------------------------------------------------------
  // ROUND HANDLERS
  // -------------------------------------------------------------
  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRoundName.trim();
    if (!trimmed) return;

    setIsAddingRound(true);
    try {
      const parsedDate = newRoundDate ? new Date(newRoundDate) : undefined;
      const nextNumber = initialRounds.length + 1;
      const res = await createRound({
        name: trimmed,
        seasonId,
        roundNumber: nextNumber,
        date: parsedDate,
      });
      if (!res.success) {
        toast({
          title: "Chyba při vytváření kola",
          description: res.error || "Kolo se nepodařilo vytvořit.",
          variant: "destructive",
        });
        return;
      }
      setNewRoundName("");
      setNewRoundDate("");
      toast({
        title: "Kolo vytvořeno",
        description: `Turnajový večer „${trimmed}“ byl přidán.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při vytváření kola",
        description: err?.message || "Kolo se nepodařilo vytvořit.",
        variant: "destructive",
      });
    } finally {
      setIsAddingRound(false);
    }
  };

  const handleSaveRoundEdit = async (roundId: number) => {
    const trimmed = editingRoundName.trim();
    if (!trimmed) {
      toast({
        title: "Chyba",
        description: "Název kola nesmí být prázdný.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingRound(true);
    try {
      const parsedDate = editingRoundDate ? new Date(editingRoundDate) : undefined;
      const res = await updateRound(roundId, {
        name: trimmed,
        ...(editingRoundDate !== "" ? { date: parsedDate } : {}),
      });
      if (!res.success) {
        toast({
          title: "Chyba při úpravě kola",
          description: res.error || "Úprava se nezdařila.",
          variant: "destructive",
        });
        return;
      }
      setEditingRoundId(null);
      toast({
        title: "Kolo upraveno",
        description: `Turnajový večer byl přejmenován na „${trimmed}“.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při úpravě kola",
        description: err?.message || "Úprava se nezdařila.",
        variant: "destructive",
      });
    } finally {
      setIsSavingRound(false);
    }
  };

  const handleConfirmDeleteRound = async () => {
    if (!deletingRound) return;
    setIsDeletingRound(true);
    try {
      const res = await deleteRound(deletingRound.id);
      if (!res.success) {
        toast({
          title: "Chyba při mazání kola",
          description: res.error || "Smazání se nezdařilo.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Kolo smazáno",
        description: `Kolo „${deletingRound.name}“ a všechny jeho zápasy byly smazány.`,
      });
      setDeletingRound(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při mazání kola",
        description: err?.message || "Smazání se nezdařilo.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingRound(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 1. Turnajové večery (Rounds) */}
      <section className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-base-200 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Turnajové večery v tomto semestru
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                Přidání, přejmenování a správa jednotlivých turnajových kol
              </p>
            </div>
            <span className="badge badge-neutral text-xs tabular-nums font-semibold self-start sm:self-auto">
              {initialRounds.length} kol
            </span>
          </div>

          {/* Formulář pro přidání kola */}
          <form
            onSubmit={handleAddRound}
            className="flex flex-col sm:flex-row gap-2 mb-4 p-3 bg-base-200/50 rounded-xl border border-base-300"
          >
            <input
              value={newRoundName}
              onChange={(e) => setNewRoundName(e.target.value)}
              placeholder="Název kola (např. 1. Kolo / Velké Finále)"
              className="input input-bordered input-sm flex-1 font-medium"
              disabled={isAddingRound}
              required
            />
            <input
              type="date"
              value={newRoundDate}
              onChange={(e) => setNewRoundDate(e.target.value)}
              className="input input-bordered input-sm shrink-0 font-medium"
              disabled={isAddingRound}
            />
            <button
              type="submit"
              disabled={isAddingRound || !newRoundName.trim()}
              className="btn btn-primary btn-sm font-bold shrink-0 gap-1.5"
            >
              {isAddingRound ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>Vytvořit kolo</span>
            </button>
          </form>

          {/* Seznam kol */}
          <div className="flex flex-col divide-y divide-base-200">
            {initialRounds.map((r) => {
              const isEditing = editingRoundId === r.id;

              return (
                <div
                  key={r.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-base-200/30 px-2 rounded-lg transition-colors"
                >
                  {isEditing ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        value={editingRoundName}
                        onChange={(e) => setEditingRoundName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveRoundEdit(r.id);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingRoundId(null);
                          }
                        }}
                        className="input input-bordered input-sm flex-1 font-semibold"
                        placeholder="Název kola"
                        disabled={isSavingRound}
                        autoFocus
                      />
                      <input
                        type="date"
                        value={editingRoundDate}
                        onChange={(e) => setEditingRoundDate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveRoundEdit(r.id);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingRoundId(null);
                          }
                        }}
                        className="input input-bordered input-sm font-medium"
                        disabled={isSavingRound}
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSaveRoundEdit(r.id)}
                          disabled={isSavingRound}
                          className="btn btn-success btn-xs text-white gap-1"
                          title="Uložit název"
                        >
                          {isSavingRound ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>Uložit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRoundId(null)}
                          disabled={isSavingRound}
                          className="btn btn-ghost btn-xs"
                          title="Zrušit úpravy"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="badge badge-neutral font-black text-xs w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tabular-nums">
                        {r.roundNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/rounds/${r.id}`}
                            className="font-bold text-sm sm:text-base text-base-content hover:text-primary transition-colors truncate"
                          >
                            {r.name}
                          </Link>
                          {r.isCompleted && (
                            <span className="badge badge-success badge-xs text-[10px] font-bold text-white">
                              Odehráno
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-base-content/60">
                          {r.date
                            ? new Date(r.date).toLocaleDateString("cs-CZ")
                            : "Termín neurčen"}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <Link
                        href={`/rounds/${r.id}`}
                        className="btn btn-ghost btn-xs text-xs font-semibold"
                      >
                        Otevřít kolo
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoundId(r.id);
                          setEditingRoundName(r.name);
                          setEditingRoundDate(
                            r.date
                              ? new Date(r.date).toISOString().split("T")[0]
                              : ""
                          );
                        }}
                        className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-base-content"
                        title="Přejmenovat kolo"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingRound(r)}
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                        title="Smazat kolo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {initialRounds.length === 0 && (
              <p className="text-base-content/60 italic text-xs py-4 text-center">
                V tomto semestru zatím nejsou žádné turnajové večery.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. Správa Týmů a Hráčů v sezóně */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Správa týmů */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-3.5 sm:p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold">Týmy v semestru</h2>
              </div>
              <span className="badge badge-neutral text-xs tabular-nums font-semibold">
                {initialTeams.length}
              </span>
            </div>

            {/* Formulář pro přidání týmu */}
            <form onSubmit={handleAddTeam} className="flex gap-2 mb-3">
              <input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Název nového týmu"
                className="input input-bordered input-sm flex-1 font-medium"
                disabled={isAddingTeam}
                required
              />
              <button
                type="submit"
                disabled={isAddingTeam || !newTeamName.trim()}
                className="btn btn-primary btn-sm font-bold shrink-0 gap-1"
              >
                {isAddingTeam && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Přidat tým</span>
              </button>
            </form>

            {/* Seznam týmů s inline editací a mazáním */}
            <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
              {initialTeams.map((t) => {
                const isEditing = editingTeamId === t.id;

                return (
                  <div
                    key={t.id}
                    className="flex justify-between items-center px-3 py-2 rounded-lg bg-base-200/60 text-xs hover:bg-base-200 transition-colors gap-2"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <input
                          value={editingTeamName}
                          onChange={(e) => setEditingTeamName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveTeamEdit(t.id);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingTeamId(null);
                            }
                          }}
                          className="input input-bordered input-xs flex-1 font-semibold"
                          disabled={isSavingTeam}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveTeamEdit(t.id)}
                          disabled={isSavingTeam}
                          className="btn btn-success btn-xs btn-square text-white"
                          title="Uložit název"
                        >
                          {isSavingTeam ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTeamId(null)}
                          disabled={isSavingTeam}
                          className="btn btn-ghost btn-xs btn-square"
                          title="Zrušit"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewTeamId(t.id)}
                          className="font-bold text-left hover:text-primary transition-colors truncate flex-1"
                          title="Zobrazit profil a statistiky týmu"
                        >
                          {t.name}
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTeamId(t.id);
                              setEditingTeamName(t.name);
                            }}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content"
                            title="Upravit název týmu"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingTeam(t)}
                            className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                            title="Smazat tým"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {initialTeams.length === 0 && (
                <p className="text-base-content/60 italic text-xs py-3 text-center">
                  Zatím žádné týmy.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Správa hráčů */}
        <section className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-3.5 sm:p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold">Registrovaní hráči</h2>
              </div>
              <span className="badge badge-neutral text-xs tabular-nums font-semibold">
                {initialPlayers.length}
              </span>
            </div>

            {/* Formulář pro přidání hráče */}
            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-3">
              <input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Jméno a příjmení hráče"
                className="input input-bordered input-sm flex-1 font-medium"
                disabled={isAddingPlayer}
                required
              />
              <button
                type="submit"
                disabled={isAddingPlayer || !newPlayerName.trim()}
                className="btn btn-primary btn-sm font-bold shrink-0 gap-1"
              >
                {isAddingPlayer && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Přidat hráče</span>
              </button>
            </form>

            {/* Seznam hráčů s inline editací a mazáním */}
            <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
              {initialPlayers.map((p) => {
                const isEditing = editingPlayerId === p.id;

                return (
                  <div
                    key={p.id}
                    className="flex justify-between items-center px-3 py-2 rounded-lg bg-base-200/60 text-xs hover:bg-base-200 transition-colors gap-2"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <input
                          value={editingPlayerName}
                          onChange={(e) => setEditingPlayerName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSavePlayerEdit(p.id);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingPlayerId(null);
                            }
                          }}
                          className="input input-bordered input-xs flex-1 font-semibold"
                          disabled={isSavingPlayer}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePlayerEdit(p.id)}
                          disabled={isSavingPlayer}
                          className="btn btn-success btn-xs btn-square text-white"
                          title="Uložit jméno"
                        >
                          {isSavingPlayer ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPlayerId(null)}
                          disabled={isSavingPlayer}
                          className="btn btn-ghost btn-xs btn-square"
                          title="Zrušit"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewPlayerId(p.id)}
                          className="font-bold text-left hover:text-primary transition-colors truncate flex-1"
                          title="Zobrazit statistiky hráče"
                        >
                          {p.name}
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlayerId(p.id);
                              setEditingPlayerName(p.name);
                            }}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content"
                            title="Upravit jméno hráče"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingPlayer(p)}
                            className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                            title="Smazat hráče"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {initialPlayers.length === 0 && (
                <p className="text-base-content/60 italic text-xs py-3 text-center">
                  Zatím žádní hráči.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Potvrzovací dialog pro smazání týmu */}
      <ConfirmDeleteDialog
        open={Boolean(deletingTeam)}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
        title="Smazat tým"
        description={`Opravdu chcete smazat tým „${deletingTeam?.name}“? Tato akce je nevratná a odstraní všechna data spojená s tímto týmem v této sezóně.`}
        onConfirm={handleConfirmDeleteTeam}
        isPending={isDeletingTeam}
      />

      {/* Potvrzovací dialog pro smazání hráče */}
      <ConfirmDeleteDialog
        open={Boolean(deletingPlayer)}
        onOpenChange={(open) => !open && setDeletingPlayer(null)}
        title="Smazat hráče"
        description={`Opravdu chcete smazat hráče „${deletingPlayer?.name}“? Tato akce je nevratná a odstraní záznamy z této sezóny.`}
        onConfirm={handleConfirmDeletePlayer}
        isPending={isDeletingPlayer}
      />

      {/* Potvrzovací dialog pro smazání kola */}
      <ConfirmDeleteDialog
        open={Boolean(deletingRound)}
        onOpenChange={(open) => !open && setDeletingRound(null)}
        title="Smazat turnajový večer"
        description={`Opravdu chcete smazat kolo „${deletingRound?.name}“? Budou nevratně odstraněny všechny zápasy, rozpis stolů a skóre odehrané v tomto kole.`}
        onConfirm={handleConfirmDeleteRound}
        isPending={isDeletingRound}
      />

      {/* Modální okno pro detail hráče */}
      <PlayerDetailModal
        playerId={viewPlayerId}
        isOpen={Boolean(viewPlayerId)}
        onOpenChange={(open) => !open && setViewPlayerId(null)}
      />

      {/* Modální okno pro detail týmu */}
      <TeamDetailModal
        teamId={viewTeamId}
        isOpen={Boolean(viewTeamId)}
        onOpenChange={(open) => !open && setViewTeamId(null)}
      />
    </div>
  );
}
