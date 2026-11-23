"use server";

import { db } from "@/db";
import { round } from "@/db/schema";
import { Round } from "@/db/types";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth";

export async function getRoundsForSeason(seasonId: number) {
  return db
    .select()
    .from(round)
    .where(eq(round.seasonId, seasonId))
    .orderBy(asc(round.roundNumber));
}

export async function getRoundById(id: number) {
  const result = await db
    .select()
    .from(round)
    .where(eq(round.id, id))
    .limit(1);
  return result[0];
}

export async function createRound(data: {
  name: string;
  seasonId: number;
  roundNumber?: number;
  date?: Date;
}) {
  try {
    await requireAuth();
    const trimmed = data.name.trim();
    if (!trimmed) {
      return { success: false, error: "Název kola nesmí být prázdný." };
    }

    const result = await db
      .insert(round)
      .values({
        name: trimmed,
        seasonId: data.seasonId,
        roundNumber: data.roundNumber ?? 1,
        date: data.date,
      })
      .returning();
    revalidatePath("/");
    revalidatePath(`/seasons/${data.seasonId}`);
    return { success: true, data: result[0] };
  } catch (err: unknown) {
    const errorObj = err as { message?: string } | null;
    return {
      success: false,
      error: errorObj?.message || "Kolo se nepodařilo vytvořit.",
    };
  }
}

export async function updateRound(id: number, data: Partial<Round>) {
  try {
    await requireAuth();
    const trimmedName = data.name !== undefined ? data.name.trim() : undefined;
    if (trimmedName !== undefined && !trimmedName) {
      return { success: false, error: "Název kola nesmí být prázdný." };
    }
    const result = await db
      .update(round)
      .set({
        ...(trimmedName !== undefined ? { name: trimmedName } : {}),
        ...(data.roundNumber !== undefined
          ? { roundNumber: data.roundNumber }
          : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.isCompleted !== undefined
          ? { isCompleted: data.isCompleted }
          : {}),
      })
      .where(eq(round.id, id))
      .returning();
    revalidatePath("/");
    return { success: true, data: result[0] };
  } catch (err: unknown) {
    const errorObj = err as { message?: string } | null;
    return {
      success: false,
      error: errorObj?.message || "Úprava kola se nezdařila.",
    };
  }
}

export async function deleteRound(id: number) {
  try {
    await requireAuth();
    const result = await db
      .delete(round)
      .where(eq(round.id, id))
      .returning();
    revalidatePath("/");
    return { success: true, data: result[0] };
  } catch (err: unknown) {
    const errorObj = err as { message?: string } | null;
    return {
      success: false,
      error: errorObj?.message || "Smazání kola se nezdařilo.",
    };
  }
}
