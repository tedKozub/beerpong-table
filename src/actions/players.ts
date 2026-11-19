"use server";

import { db } from "@/db";
import { player } from "@/db/schema";
import { Player } from "@/db/types";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth";

export async function getPlayersForSeason(seasonId: number) {
  return db.select().from(player).where(eq(player.seasonId, seasonId));
}

export async function getPlayerById(id: number) {
  const result = await db
    .select()
    .from(player)
    .where(eq(player.id, id))
    .limit(1);
  return result[0];
}

export async function createPlayer(data: { name: string; seasonId: number }) {
  await requireAuth();
  const trimmed = data.name.trim();
  if (!trimmed) {
    throw new Error("Jméno hráče nesmí být prázdné.");
  }

  // Kontrola duplicitního jména hráče v dané sezóně
  const existing = await db
    .select()
    .from(player)
    .where(and(eq(player.seasonId, data.seasonId), eq(player.name, trimmed)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Hráč se jménem „${trimmed}“ již v této sezóně existuje.`);
  }

  try {
    const result = await db
      .insert(player)
      .values({
        name: trimmed,
        seasonId: data.seasonId,
      })
      .returning();
    revalidatePath("/");
    return result[0];
  } catch (err: any) {
    if (err?.code === "23505" || err?.message?.includes("unique")) {
      throw new Error(`Hráč se jménem „${trimmed}“ již v této sezóně existuje.`);
    }
    throw err;
  }
}

export async function updatePlayer(id: number, data: Partial<Player>) {
  await requireAuth();
  const current = await getPlayerById(id);
  if (!current) {
    throw new Error("Hráč nebyl nalezen.");
  }

  const trimmed = data.name !== undefined ? data.name.trim() : undefined;
  if (trimmed !== undefined) {
    if (!trimmed) {
      throw new Error("Jméno hráče nesmí být prázdné.");
    }

    // Kontrola, zda jiný hráč v téže sezóně nemá stejné jméno
    const existing = await db
      .select()
      .from(player)
      .where(and(eq(player.seasonId, current.seasonId), eq(player.name, trimmed)))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== id) {
      throw new Error(`Hráč se jménem „${trimmed}“ již v této sezóně existuje.`);
    }
  }

  try {
    const result = await db
      .update(player)
      .set({
        ...(trimmed !== undefined ? { name: trimmed } : {}),
      })
      .where(eq(player.id, id))
      .returning();
    revalidatePath("/");
    return result[0];
  } catch (err: any) {
    if (err?.code === "23505" || err?.message?.includes("unique")) {
      throw new Error(`Hráč s tímto jménem již v této sezóně existuje.`);
    }
    throw err;
  }
}

export async function deletePlayer(id: number) {
  await requireAuth();
  const result = await db
    .delete(player)
    .where(eq(player.id, id))
    .returning();
  revalidatePath("/");
  return result[0];
}
