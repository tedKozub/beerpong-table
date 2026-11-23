"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSeason } from "@/actions/seasons";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface DeleteSeasonButtonProps {
  seasonId: number;
  seasonName: string;
  isActive?: boolean;
}

export function DeleteSeasonButton({
  seasonId,
  seasonName,
  isActive = false,
}: DeleteSeasonButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteSeason(seasonId);
      if (!res.success) {
        toast({
          title: "Chyba při mazání semestru",
          description: res.error || "Smazání se nezdařilo.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Semestr smazán",
        description: `Semestr „${seasonName}“ byl úspěšně odstraněn.`,
      });
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const errorObj = err as { message?: string } | null;
      toast({
        title: "Chyba při mazání semestru",
        description: errorObj?.message || "Smazání se nezdařilo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
        title="Smazat celou sezónu"
      >
        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Smazat</span>
      </button>

      <ConfirmDeleteDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Smazat celý semestr"
        description={
          isActive
            ? `Pozor: Tento semestr je aktuálně nastaven jako aktivní. Opravdu chcete smazat semestr „${seasonName}“? Všechna turnajová kola, zápasy a statistiky tohoto semestru budou nenávratně odstraněny.`
            : `Opravdu chcete smazat semestr „${seasonName}“? Všechna turnajová kola, zápasy a statistiky tohoto semestru budou nenávratně odstraněny.`
        }
        confirmLabel="Smazat semestr"
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}
