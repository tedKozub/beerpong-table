"use server";

import { db } from "@/db";
import { player, scheduledMatch, team, teamPlayer } from "@/db/schema";
import { Team } from "@/db/types";
import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTeamsForSeason(seasonId: number) {
  return db.select().from(team).where(eq(team.seasonId, seasonId));
}

export async function getTeamById(id: number) {
  const result = await db.select().from(team).where(eq(team.id, id)).limit(1);
  return result[0];
}

export async function createTeam(data: { name: string; seasonId: number }) {
  const result = await db
    .insert(team)
    .values({
      name: data.name,
      seasonId: data.seasonId,
    })
    .returning();
  revalidatePath("/");
  return result[0];
}

export async function updateTeam(id: number, data: Partial<Team>) {
  const result = await db
    .update(team)
    .set({
      ...(data.name ? { name: data.name } : {}),
    })
    .where(eq(team.id, id))
    .returning();
  revalidatePath("/");
  return result[0];
}

export async function deleteTeam(id: number) {
  const result = await db.delete(team).where(eq(team.id, id)).returning();
  revalidatePath("/");
  return result[0];
}

// Přiřazení hráče do týmu v daném kole (večeru)
export async function assignPlayerToTeamInRound(
  roundId: number,
  teamId: number,
  playerId: number
) {
  // Smažeme případné existující přiřazení hráče v daném kole (hráč může být v kole jen v jednom týmu)
  await db
    .delete(teamPlayer)
    .where(
      and(eq(teamPlayer.roundId, roundId), eq(teamPlayer.playerId, playerId))
    );

  const result = await db
    .insert(teamPlayer)
    .values({
      roundId,
      teamId,
      playerId,
    })
    .returning();

  revalidatePath("/");
  return result[0];
}

// Odebrání hráče z kola
export async function removePlayerFromTeamInRound(
  roundId: number,
  playerId: number
) {
  const result = await db
    .delete(teamPlayer)
    .where(
      and(eq(teamPlayer.roundId, roundId), eq(teamPlayer.playerId, playerId))
    )
    .returning();
  revalidatePath("/");
  return result[0];
}

// Získání soupisky týmů v daném kole
export async function getTeamPlayersForRound(roundId: number, teamId?: number) {
  const query = db
    .select({
      id: teamPlayer.id,
      roundId: teamPlayer.roundId,
      teamId: teamPlayer.teamId,
      playerId: player.id,
      playerName: player.name,
    })
    .from(teamPlayer)
    .innerJoin(player, eq(teamPlayer.playerId, player.id))
    .where(
      teamId
        ? and(eq(teamPlayer.roundId, roundId), eq(teamPlayer.teamId, teamId))
        : eq(teamPlayer.roundId, roundId)
    );

  return query;
}

export async function addTeamWithPlayersToRound(
  roundId: number,
  seasonId: number,
  data: {
    teamName: string;
    player1Name: string;
    player2Name: string;
  }
) {
  const trimmedTeam = data.teamName.trim();
  const trimmedP1 = data.player1Name.trim();
  const trimmedP2 = data.player2Name.trim();

  if (!trimmedTeam || !trimmedP1 || !trimmedP2) {
    return { error: "Vyplň název týmu i oba hráče" };
  }

  // 1. Najít nebo vytvořit tým v rámci sezóny
  const existingTeam = await db
    .select()
    .from(team)
    .where(and(eq(team.seasonId, seasonId), eq(team.name, trimmedTeam)))
    .limit(1);

  let targetTeamId: number;
  if (existingTeam.length > 0) {
    targetTeamId = existingTeam[0].id;
  } else {
    const [newTeam] = await db
      .insert(team)
      .values({ name: trimmedTeam, seasonId })
      .returning();
    targetTeamId = newTeam.id;
  }

  // 2. Najít nebo vytvořit hráče 1
  const existingP1 = await db
    .select()
    .from(player)
    .where(and(eq(player.seasonId, seasonId), eq(player.name, trimmedP1)))
    .limit(1);

  let p1Id: number;
  if (existingP1.length > 0) {
    p1Id = existingP1[0].id;
  } else {
    const [newP1] = await db
      .insert(player)
      .values({ name: trimmedP1, seasonId })
      .returning();
    p1Id = newP1.id;
  }

  // 3. Najít nebo vytvořit hráče 2
  const existingP2 = await db
    .select()
    .from(player)
    .where(and(eq(player.seasonId, seasonId), eq(player.name, trimmedP2)))
    .limit(1);

  let p2Id: number;
  if (existingP2.length > 0) {
    p2Id = existingP2[0].id;
  } else {
    const [newP2] = await db
      .insert(player)
      .values({ name: trimmedP2, seasonId })
      .returning();
    p2Id = newP2.id;
  }

  // 4. Smazat staré přiřazení těchto hráčů v daném kole a vložit nové do teamPlayer
  await db
    .delete(teamPlayer)
    .where(
      and(
        eq(teamPlayer.roundId, roundId),
        or(eq(teamPlayer.playerId, p1Id), eq(teamPlayer.playerId, p2Id))
      )
    );

  await db.insert(teamPlayer).values([
    { roundId, teamId: targetTeamId, playerId: p1Id },
    { roundId, teamId: targetTeamId, playerId: p2Id },
  ]);

  try {
    revalidatePath(`/rounds/${roundId}`);
    revalidatePath(`/public/rounds/${roundId}`);
  } catch {}

  return { success: true, teamId: targetTeamId };
}

export async function removeTeamFromRound(roundId: number, teamId: number) {
  // Smažeme přiřazené hráče k tomuto týmu v kole
  await db
    .delete(teamPlayer)
    .where(
      and(eq(teamPlayer.roundId, roundId), eq(teamPlayer.teamId, teamId))
    );

  // Smažeme případné naplánované zápasy tohoto týmu v kole
  await db
    .delete(scheduledMatch)
    .where(
      and(
        eq(scheduledMatch.roundId, roundId),
        or(
          eq(scheduledMatch.team1Id, teamId),
          eq(scheduledMatch.team2Id, teamId)
        )
      )
    );

  try {
    revalidatePath(`/rounds/${roundId}`);
    revalidatePath(`/public/rounds/${roundId}`);
  } catch {}

  return { success: true };
}

