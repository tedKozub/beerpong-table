"use server";

import { db } from "@/db";
import { player } from "@/db/schema";
import { Player } from "@/db/types";
import { eq, and, sql } from "drizzle-orm";
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
  try {
    await requireAuth();
    const trimmed = data.name.trim();
    if (!trimmed) {
      return { success: false, error: "Jméno hráče nesmí být prázdné." };
    }

    // Kontrola duplicitního jména hráče v dané sezóně (case-insensitive)
    const existing = await db
      .select()
      .from(player)
      .where(
        and(
          eq(player.seasonId, data.seasonId),
          sql`lower(${player.name}) = lower(${trimmed})`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: `Hráč se jménem „${trimmed}“ již v tomto semestru existuje.`,
      };
    }

    const result = await db
      .insert(player)
      .values({
        name: trimmed,
        seasonId: data.seasonId,
      })
      .returning();
    revalidatePath("/");
    revalidatePath(`/seasons/${data.seasonId}`);
    return { success: true, data: result[0] };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string } | null;
    if (errorObj?.code === "23505" || errorObj?.message?.includes("unique")) {
      return {
        success: false,
        error: `Hráč se jménem „${data.name.trim()}“ již v tomto semestru existuje.`,
      };
    }
    return {
      success: false,
      error: errorObj?.message || "Hráče se nepodařilo přidat.",
    };
  }
}

export async function updatePlayer(id: number, data: Partial<Player>) {
  try {
    await requireAuth();
    const current = await getPlayerById(id);
    if (!current) {
      return { success: false, error: "Hráč nebyl nalezen." };
    }

    const trimmed = data.name !== undefined ? data.name.trim() : undefined;
    if (trimmed !== undefined) {
      if (!trimmed) {
        return { success: false, error: "Jméno hráče nesmí být prázdné." };
      }

      // Kontrola, zda jiný hráč v téže sezóně nemá stejné jméno (case-insensitive)
      const existing = await db
        .select()
        .from(player)
        .where(
          and(
            eq(player.seasonId, current.seasonId),
            sql`lower(${player.name}) = lower(${trimmed})`
          )
        )
        .limit(1);

      if (existing.length > 0 && existing[0].id !== id) {
        return {
          success: false,
          error: `Hráč se jménem „${trimmed}“ již v tomto semestru existuje.`,
        };
      }
    }

    const result = await db
      .update(player)
      .set({
        ...(trimmed !== undefined ? { name: trimmed } : {}),
      })
      .where(eq(player.id, id))
      .returning();
    revalidatePath("/");
    revalidatePath(`/seasons/${current.seasonId}`);
    return { success: true, data: result[0] };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string } | null;
    if (errorObj?.code === "23505" || errorObj?.message?.includes("unique")) {
      return {
        success: false,
        error: `Hráč s tímto jménem již v tomto semestru existuje.`,
      };
    }
    return {
      success: false,
      error: errorObj?.message || "Úprava hráče se nezdařila.",
    };
  }
}

export async function deletePlayer(id: number) {
  try {
    await requireAuth();
    const result = await db
      .delete(player)
      .where(eq(player.id, id))
      .returning();
    revalidatePath("/");
    return { success: true, data: result[0] };
  } catch (err: unknown) {
    const errorObj = err as { message?: string } | null;
    return {
      success: false,
      error: errorObj?.message || "Smazání hráče se nezdařilo.",
    };
  }
}
