"use client";

import { useState } from "react";
import { deleteMatch } from "@/actions/matches";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function DeleteMatchButton({ matchId }: { matchId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMatch(matchId);
      toast({
        title: "Zápas smazán",
        description: "Zápas byl úspěšně odstraněn a statistiky přepočteny.",
      });
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Chyba při mazání zápasu",
        description: err?.message || "Smazání se nezdařilo.",
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
        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
        title="Smazat zápas"
      >
        Smazat
      </button>

      <ConfirmDeleteDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Smazat zápas"
        description="Opravdu chcete smazat tento zápas? Výsledek a zapsané body hráčů budou nevratně odstraněny."
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}
