"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updateRound } from "@/actions/rounds";
import { Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoundHeaderActionsProps {
  roundId: number;
  seasonId?: number;
  currentName: string;
  currentDate?: Date | null;
  isCompleted?: boolean;
}

export function RoundHeaderActions({
  roundId,
  currentName,
  currentDate,
}: RoundHeaderActionsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [date, setDate] = useState(
    currentDate ? new Date(currentDate).toISOString().split("T")[0] : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast({
        title: "Chyba",
        description: "Název kola nesmí být prázdný.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const parsedDate = date ? new Date(date) : undefined;
      const res = await updateRound(roundId, {
        name: trimmed,
        date: parsedDate,
      });
      if (!res.success) {
        toast({
          title: "Chyba při úpravě kola",
          description: res.error || "Úprava se nezdařila.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Kolo upraveno",
        description: `Turnajový večer byl přejmenován na „${trimmed}“.`,
      });
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při úpravě kola",
        description: err?.message || "Úprava se nezdařila.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={() => {
          setName(currentName);
          setDate(
            currentDate ? new Date(currentDate).toISOString().split("T")[0] : ""
          );
          setIsEditDialogOpen(true);
        }}
        className="btn btn-outline btn-xs sm:btn-sm text-xs gap-1 font-semibold"
        title="Přejmenovat kolo"
        aria-label="Přejmenovat kolo"
      >
        <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        <span className="hidden sm:inline">Přejmenovat kolo</span>
      </button>

      {/* Dialog pro úpravu kola */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-base-100 border border-base-300 text-base-content p-4 sm:p-6 shadow-2xl">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Přejmenovat turnajové kolo
              </DialogTitle>
              <DialogDescription className="text-xs text-base-content/70">
                Upravte název nebo termín konání tohoto kola.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-base-content/80 mb-1 block">
                  Název kola
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered input-sm w-full font-semibold"
                  placeholder="např. 1. Kolo / Velké Finále"
                  disabled={isSaving}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-base-content/80 mb-1 block">
                  Datum konání
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input input-bordered input-sm w-full font-medium"
                  disabled={isSaving}
                />
              </div>
            </div>

            <DialogFooter className="mt-2 gap-2">
              <button
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                className="btn btn-ghost btn-sm text-xs"
                disabled={isSaving}
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="btn btn-primary btn-sm text-xs font-bold gap-1"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Uložit změny</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
