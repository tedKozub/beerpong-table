"use server";

import { db } from "@/db";
import { match, round, scheduledMatch, team } from "@/db/schema";
import { generateSchedule } from "@/lib/schedule";
import { aliasedTable, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ScheduledMatchWithResult = {
  round: number; // match wave / sub-round
  tableNumber: number;
  team1Id: number;
  team2Id: number;
  team1Name: string;
  team2Name: string;
  score: string | null;
};

export const getScheduleForRound = async (
  roundId: number
): Promise<ScheduledMatchWithResult[]> => {
  const team1 = aliasedTable(team, "team1");
  const team2 = aliasedTable(team, "team2");

  const [schedule, matches] = await Promise.all([
    db
      .select({
        round: scheduledMatch.matchRound,
        tableNumber: scheduledMatch.tableNumber,
        team1Id: scheduledMatch.team1Id,
        team2Id: scheduledMatch.team2Id,
        team1Name: team1.name,
        team2Name: team2.name,
      })
      .from(scheduledMatch)
      .leftJoin(team1, eq(scheduledMatch.team1Id, team1.id))
      .leftJoin(team2, eq(scheduledMatch.team2Id, team2.id))
      .where(eq(scheduledMatch.roundId, roundId))
      .orderBy(asc(scheduledMatch.matchRound), asc(scheduledMatch.tableNumber)),
    db
      .select({
        team1Id: match.team1Id,
        team2Id: match.team2Id,
        team1Score: match.team1Score,
        team2Score: match.team2Score,
      })
      .from(match)
      .where(eq(match.roundId, roundId)),
  ]);

  const playedScore = (team1Id: number | null, team2Id: number | null) => {
    for (const m of matches) {
      if (m.team1Id === team1Id && m.team2Id === team2Id) {
        return `${m.team1Score}:${m.team2Score}`;
      }
      if (m.team1Id === team2Id && m.team2Id === team1Id) {
        return `${m.team2Score}:${m.team1Score}`;
      }
    }
    return null;
  };

  return schedule.map((m) => ({
    round: m.round ?? 1,
    tableNumber: m.tableNumber ?? 1,
    team1Id: m.team1Id ?? 0,
    team2Id: m.team2Id ?? 0,
    team1Name: m.team1Name ?? `Tým #${m.team1Id}`,
    team2Name: m.team2Name ?? `Tým #${m.team2Id}`,
    score: playedScore(m.team1Id, m.team2Id),
  }));
};

export const createScheduleForRound = async (
  roundId: number,
  tables: number
) => {
  if (!Number.isInteger(tables) || tables < 1) {
    return { error: "Zadej platný počet stolů" };
  }

  const [currentRound] = await db
    .select()
    .from(round)
    .where(eq(round.id, roundId))
    .limit(1);

  if (!currentRound) {
    return { error: "Kolo nebylo nalezeno" };
  }

  const teams = await db
    .select({ id: team.id })
    .from(team)
    .where(eq(team.seasonId, currentRound.seasonId))
    .orderBy(asc(team.id));

  if (teams.length < 2) {
    return { error: "V semestru musí být alespoň 2 týmy pro vytvoření rozpisu" };
  }

  const schedule = generateSchedule(
    teams.map((t) => t.id),
    tables
  );

  await db.transaction(async (tx) => {
    await tx
      .delete(scheduledMatch)
      .where(eq(scheduledMatch.roundId, roundId));

    await tx.insert(scheduledMatch).values(
      schedule.map((m) => ({
        roundId,
        matchRound: m.round,
        tableNumber: m.tableNumber,
        team1Id: m.team1Id,
        team2Id: m.team2Id,
      }))
    );
  });

  try {
    revalidatePath(`/rounds/${roundId}`);
    revalidatePath(`/public/rounds/${roundId}`);
  } catch {}
  return { success: true };
};

export const deleteScheduleForRound = async (roundId: number) => {
  await db
    .delete(scheduledMatch)
    .where(eq(scheduledMatch.roundId, roundId));

  try {
    revalidatePath(`/rounds/${roundId}`);
    revalidatePath(`/public/rounds/${roundId}`);
  } catch {}
};
