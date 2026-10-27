"use server";

import { db } from "@/db";
import { match, player, playerMatchScore, team } from "@/db/schema";
import { Match } from "@/db/types";
import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMatchesForRound(roundId: number) {
  const matches = await db
    .select({
      id: match.id,
      roundId: match.roundId,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      status: match.status,
      createdAt: match.createdAt,
    })
    .from(match)
    .where(eq(match.roundId, roundId));

  const allTeams = await db.select().from(team);
  const teamMap = new Map<number, string>(allTeams.map((t) => [t.id, t.name]));

  return matches.map((m) => ({
    ...m,
    team1Name: teamMap.get(m.team1Id) ?? `Tým #${m.team1Id}`,
    team2Name: teamMap.get(m.team2Id) ?? `Tým #${m.team2Id}`,
  }));
}

export async function getMatchById(id: number) {
  const result = await db
    .select()
    .from(match)
    .where(eq(match.id, id))
    .limit(1);

  if (!result[0]) return null;

  const m = result[0];
  const [t1] = await db.select().from(team).where(eq(team.id, m.team1Id)).limit(1);
  const [t2] = await db.select().from(team).where(eq(team.id, m.team2Id)).limit(1);

  const playerScores = await db
    .select({
      id: playerMatchScore.id,
      playerId: player.id,
      playerName: player.name,
      teamId: playerMatchScore.teamId,
      score: playerMatchScore.score,
      blowjobs: playerMatchScore.blowjobs,
    })
    .from(playerMatchScore)
    .innerJoin(player, eq(playerMatchScore.playerId, player.id))
    .where(eq(playerMatchScore.matchId, id));

  return {
    ...m,
    team1Name: t1?.name ?? `Tým #${m.team1Id}`,
    team2Name: t2?.name ?? `Tým #${m.team2Id}`,
    playerScores,
  };
}

export async function createMatch(data: {
  roundId: number;
  team1Id: number;
  team2Id: number;
  team1Score?: number;
  team2Score?: number;
  status?: string;
  playerScores?: {
    playerId: number;
    teamId: number;
    score: number;
    blowjobs: number;
  }[];
}) {
  const [newMatch] = await db
    .insert(match)
    .values({
      roundId: data.roundId,
      team1Id: data.team1Id,
      team2Id: data.team2Id,
      team1Score: data.team1Score ?? 0,
      team2Score: data.team2Score ?? 0,
      status: data.status ?? "completed",
    })
    .returning();

  if (data.playerScores && data.playerScores.length > 0) {
    await db.insert(playerMatchScore).values(
      data.playerScores.map((ps) => ({
        matchId: newMatch.id,
        playerId: ps.playerId,
        teamId: ps.teamId,
        score: ps.score,
        blowjobs: ps.blowjobs,
      }))
    );
  }

  revalidatePath("/");
  return newMatch;
}

export async function updateMatch(
  id: number,
  data: {
    team1Score?: number;
    team2Score?: number;
    status?: string;
    playerScores?: {
      playerId: number;
      teamId: number;
      score: number;
      blowjobs: number;
    }[];
  }
) {
  const [updated] = await db
    .update(match)
    .set({
      ...(data.team1Score !== undefined ? { team1Score: data.team1Score } : {}),
      ...(data.team2Score !== undefined ? { team2Score: data.team2Score } : {}),
      ...(data.status ? { status: data.status } : {}),
    })
    .where(eq(match.id, id))
    .returning();

  if (data.playerScores !== undefined) {
    // Smažeme a znovu vložíme individuální skóre pro tento zápas
    await db
      .delete(playerMatchScore)
      .where(eq(playerMatchScore.matchId, id));

    if (data.playerScores.length > 0) {
      await db.insert(playerMatchScore).values(
        data.playerScores.map((ps) => ({
          matchId: id,
          playerId: ps.playerId,
          teamId: ps.teamId,
          score: ps.score,
          blowjobs: ps.blowjobs,
        }))
      );
    }
  }

  revalidatePath("/");
  return updated;
}

export async function deleteMatch(id: number) {
  // player_match_score se smaže automaticky díky onDelete: cascade
  const [deleted] = await db
    .delete(match)
    .where(eq(match.id, id))
    .returning();
  revalidatePath("/");
  return deleted;
}

export async function saveOrUpdateMatchScore(data: {
  roundId: number;
  team1Id: number;
  team2Id: number;
  team1Score: number;
  team2Score: number;
  playerScores: {
    playerId: number;
    teamId: number;
    score: number;
    blowjobs: number;
  }[];
}) {
  const existingMatches = await db
    .select()
    .from(match)
    .where(
      and(
        eq(match.roundId, data.roundId),
        or(
          and(eq(match.team1Id, data.team1Id), eq(match.team2Id, data.team2Id)),
          and(eq(match.team1Id, data.team2Id), eq(match.team2Id, data.team1Id))
        )
      )
    );

  let result;
  if (existingMatches.length > 0) {
    const existing = existingMatches[0];
    const isDirectOrder = existing.team1Id === data.team1Id;
    const team1Score = isDirectOrder ? data.team1Score : data.team2Score;
    const team2Score = isDirectOrder ? data.team2Score : data.team1Score;

    result = await updateMatch(existing.id, {
      team1Score,
      team2Score,
      status: "completed",
      playerScores: data.playerScores,
    });
  } else {
    result = await createMatch({
      roundId: data.roundId,
      team1Id: data.team1Id,
      team2Id: data.team2Id,
      team1Score: data.team1Score,
      team2Score: data.team2Score,
      status: "completed",
      playerScores: data.playerScores,
    });
  }

  try {
    revalidatePath(`/rounds/${data.roundId}`);
    revalidatePath(`/public/rounds/${data.roundId}`);
    revalidatePath("/");
    revalidatePath("/public");
  } catch {}

  return result;
}

export async function getMatchDetailsForTeams(
  roundId: number,
  team1Id: number,
  team2Id: number
) {
  const existingMatches = await db
    .select()
    .from(match)
    .where(
      and(
        eq(match.roundId, roundId),
        or(
          and(eq(match.team1Id, team1Id), eq(match.team2Id, team2Id)),
          and(eq(match.team1Id, team2Id), eq(match.team2Id, team1Id))
        )
      )
    );

  if (existingMatches.length === 0) return null;
  const m = existingMatches[0];

  const scores = await db
    .select({
      id: playerMatchScore.id,
      playerId: player.id,
      playerName: player.name,
      teamId: playerMatchScore.teamId,
      score: playerMatchScore.score,
      blowjobs: playerMatchScore.blowjobs,
    })
    .from(playerMatchScore)
    .innerJoin(player, eq(playerMatchScore.playerId, player.id))
    .where(eq(playerMatchScore.matchId, m.id));

  return {
    match: m,
    scores,
  };
}


