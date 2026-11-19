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
  await requireAuth();
  const result = await db
    .insert(round)
    .values({
      name: data.name,
      seasonId: data.seasonId,
      roundNumber: data.roundNumber ?? 1,
      date: data.date,
    })
    .returning();
  revalidatePath("/");
  return result[0];
}

export async function updateRound(id: number, data: Partial<Round>) {
  await requireAuth();
  const trimmedName = data.name !== undefined ? data.name.trim() : undefined;
  if (trimmedName !== undefined && !trimmedName) {
    throw new Error("Název kola nesmí být prázdný.");
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
  return result[0];
}

export async function deleteRound(id: number) {
  await requireAuth();
  const result = await db
    .delete(round)
    .where(eq(round.id, id))
    .returning();
  revalidatePath("/");
  return result[0];
}
