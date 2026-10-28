"use client";

import { setActiveSeason } from "@/actions/seasons";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface SeasonSelectorProps {
  seasons: {
    id: number;
    name: string;
    isActive: boolean;
  }[];
  currentSeasonId?: number;
}

export function SeasonSelector({
  seasons,
  currentSeasonId,
}: SeasonSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (seasons.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = Number(e.target.value);
    if (newId) {
      startTransition(async () => {
        await setActiveSeason(newId);
        router.refresh();
      });
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={currentSeasonId ?? ""}
        onChange={handleChange}
        disabled={isPending}
        className="select select-bordered select-xs sm:select-sm font-semibold bg-base-100 text-xs sm:text-sm border-base-300 focus:outline-none max-w-[110px] sm:max-w-none truncate"
        title="Výběr semestru"
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} {s.isActive ? "(aktivní)" : ""}
          </option>
        ))}
      </select>
      {isPending && (
        <span className="loading loading-spinner loading-xs text-primary" />
      )}
    </div>
  );
}
