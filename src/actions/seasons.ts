"use server";

import { db } from "@/db";
import { round, season } from "@/db/schema";
import { Season } from "@/db/types";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth";

export type SeasonActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getAllSeasons() {
  return db
    .select()
    .from(season)
    .orderBy(desc(season.isActive), desc(season.createdAt));
}

export async function getActiveSeason() {
  const active = await db
    .select()
    .from(season)
    .where(eq(season.isActive, true))
    .limit(1);

  if (active[0]) return active[0];

  // Fallback: Pokud žádná není označena, vezmeme nejnovější vytvořenou
  const latest = await db
    .select()
    .from(season)
    .orderBy(desc(season.createdAt))
    .limit(1);

  return latest[0] || null;
}

export async function setActiveSeason(id: number) {
  await requireAuth();
  // 1. Zrušíme aktivní stav u všech sezón
  await db.update(season).set({ isActive: false });

  // 2. Nastavíme danou sezónu jako aktivní
  const result = await db
    .update(season)
    .set({ isActive: true })
    .where(eq(season.id, id))
    .returning();

  revalidatePath("/");
  revalidatePath("/seasons");
  return result[0];
}

export async function getSeasonById(id: number) {
  const seasonData = await db
    .select()
    .from(season)
    .where(eq(season.id, id))
    .limit(1);
  return seasonData[0];
}

export async function createSeason(s: {
  name: string;
  isActive?: boolean;
}): Promise<SeasonActionResult<Season>> {
  await requireAuth();
  const trimmed = s.name.trim();
  if (!trimmed) {
    return { success: false, error: "Název semestru nesmí být prázdný." };
  }

  // Case-insensitive duplicate check
  const existing = await db
    .select({ id: season.id })
    .from(season)
    .where(sql`lower(${season.name}) = lower(${trimmed})`);

  if (existing.length > 0) {
    return { success: false, error: `Semestr s názvem „${trimmed}“ již existuje.` };
  }

  // Pokud je označena jako aktivní, deaktivujeme ostatní
  if (s.isActive) {
    await db.update(season).set({ isActive: false });
  }

  const [newSeason] = await db
    .insert(season)
    .values({
      name: trimmed,
      isActive: s.isActive ?? false,
    })
    .returning();

  // Automaticky pro novou sezónu semestru předvytvoříme standardních 5 kol
  const defaultRounds = [
    { name: "1. Kolo", roundNumber: 1, seasonId: newSeason.id },
    { name: "2. Kolo", roundNumber: 2, seasonId: newSeason.id },
    { name: "3. Kolo", roundNumber: 3, seasonId: newSeason.id },
    { name: "4. Kolo", roundNumber: 4, seasonId: newSeason.id },
    { name: "5. Kolo - Velké Finále", roundNumber: 5, seasonId: newSeason.id },
  ];

  await db.insert(round).values(defaultRounds);

  revalidatePath("/");
  revalidatePath("/seasons");
  return { success: true, data: newSeason };
}

export async function updateSeason(
  id: number,
  s: Partial<Season>
): Promise<SeasonActionResult<Season>> {
  await requireAuth();
  if (s.name) {
    const trimmed = s.name.trim();
    if (!trimmed) {
      return { success: false, error: "Název semestru nesmí být prázdný." };
    }
    const existing = await db
      .select({ id: season.id })
      .from(season)
      .where(
        sql`lower(${season.name}) = lower(${trimmed}) AND ${season.id} != ${id}`
      );

    if (existing.length > 0) {
      return { success: false, error: `Semestr s názvem „${trimmed}“ již existuje.` };
    }
  }

  if (s.isActive) {
    await db.update(season).set({ isActive: false });
  }

  const updatedSeason = await db
    .update(season)
    .set({
      ...(s.name ? { name: s.name.trim() } : {}),
      ...(s.isActive !== undefined ? { isActive: s.isActive } : {}),
    })
    .where(eq(season.id, id))
    .returning();

  revalidatePath("/");
  revalidatePath("/seasons");
  return { success: true, data: updatedSeason[0] };
}

export async function deleteSeason(
  id: number
): Promise<SeasonActionResult<Season | undefined>> {
  await requireAuth();
  const deletedSeason = await db
    .delete(season)
    .where(eq(season.id, id))
    .returning();
  revalidatePath("/");
  revalidatePath("/seasons");
  return { success: true, data: deletedSeason[0] };
}
