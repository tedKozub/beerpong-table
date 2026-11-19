"use server";

import { db } from "@/db";
import { player } from "@/db/schema";
import { Player } from "@/db/types";
import { eq } from "drizzle-orm";
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
  const result = await db
    .insert(player)
    .values({
      name: data.name,
      seasonId: data.seasonId,
    })
    .returning();
  revalidatePath("/");
  return result[0];
}

export async function updatePlayer(id: number, data: Partial<Player>) {
  await requireAuth();
  const result = await db
    .update(player)
    .set({
      ...(data.name ? { name: data.name } : {}),
    })
    .where(eq(player.id, id))
    .returning();
  revalidatePath("/");
  return result[0];
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
