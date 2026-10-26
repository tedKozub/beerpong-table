"use client";
import { createSchedule } from "@/actions/schedule";
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
import { useToast } from "@/hooks/use-toast";
import { pluralCs } from "@/lib/utils";
import { useState } from "react";

type Props = {
  tournamentId: number;
  defaultTables: number;
  // an existing schedule is replaced only after confirmation
  hasSchedule: boolean;
  disabled?: boolean;
};

export const ScheduleGenerateForm = ({
  tournamentId,
  defaultTables,
  hasSchedule,
  disabled,
}: Props) => {
  const { toast } = useToast();
  const [tables, setTables] = useState(String(defaultTables));
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await createSchedule(tournamentId, Number(tables));
      if (result.error) {
        toast({ title: "Rozpis nevygenerován", description: result.error });
      }
    } finally {
      setGenerating(false);
    }
  };

  const generateButton = (
    <button
      className={hasSchedule ? "btn btn-ghost" : "btn btn-primary"}
      disabled={generating || disabled}
      onClick={hasSchedule ? undefined : handleGenerate}
    >
      {generating
        ? "Generuji..."
        : hasSchedule
          ? "Přegenerovat rozpis"
          : "Vygenerovat rozpis"}
    </button>
  );

  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold text-base-content/80">
        Počet stolů
        <input
          type="number"
          min={1}
          value={tables}
          onChange={(e) => setTables(e.target.value)}
          className="input input-bordered w-28 bg-base-100 text-base-content border-base-300"
        />
      </label>
      {hasSchedule ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>{generateButton}</AlertDialogTrigger>
          <AlertDialogContent className="bg-base-100 border border-base-300 text-base-content">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-bold text-base-content">
                Přegenerovat rozpis?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base-content/70">
                Současný rozpis bude nahrazen novým pro{" "}
                {pluralCs(Number(tables), "stůl", "stoly", "stolů")}. Odehrané
                zápasy zůstanou zachovány.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="btn btn-secondary">
                Zrušit
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleGenerate}>
                Přegenerovat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        generateButton
      )}
    </div>
  );
};
