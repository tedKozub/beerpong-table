"use server";

import { db } from "@/db";
import {
  match,
  player,
  playerMatchScore,
  round,
  team,
  teamPlayer,
} from "@/db/schema";
import { eq, desc, asc, sql, and, or } from "drizzle-orm";

// 1. Skóre hráčů v rámci jednoho zápasu
export async function getPlayerScoresForMatch(matchId: number) {
  return db
    .select({
      id: playerMatchScore.id,
      matchId: playerMatchScore.matchId,
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      score: playerMatchScore.score,
      blowjobs: playerMatchScore.blowjobs,
    })
    .from(playerMatchScore)
    .innerJoin(player, eq(playerMatchScore.playerId, player.id))
    .innerJoin(team, eq(playerMatchScore.teamId, team.id))
    .where(eq(playerMatchScore.matchId, matchId));
}

// 2. Žebříček hráčů v rámci kola / večera (Král střelců & BlowJob King večera)
export async function getRoundPlayerLeaderboard(roundId: number) {
  return db
    .select({
      playerId: player.id,
      playerName: player.name,
      totalScore: sql<number>`COALESCE(SUM(${playerMatchScore.score}), 0)::int`,
      totalBlowjobs: sql<number>`COALESCE(SUM(${playerMatchScore.blowjobs}), 0)::int`,
      matchesPlayed: sql<number>`COUNT(DISTINCT ${playerMatchScore.matchId})::int`,
    })
    .from(player)
    .innerJoin(playerMatchScore, eq(player.id, playerMatchScore.playerId))
    .innerJoin(match, eq(playerMatchScore.matchId, match.id))
    .where(eq(match.roundId, roundId))
    .groupBy(player.id, player.name)
    .orderBy(
      desc(sql`SUM(${playerMatchScore.score})`),
      desc(sql`SUM(${playerMatchScore.blowjobs})`)
    );
}

// 3. Žebříček hráčů v rámci celé sezóny / semestru (Král střelců & BlowJob King semestru)
export async function getSeasonPlayerLeaderboard(seasonId: number) {
  return db
    .select({
      playerId: player.id,
      playerName: player.name,
      totalScore: sql<number>`COALESCE(SUM(${playerMatchScore.score}), 0)::int`,
      totalBlowjobs: sql<number>`COALESCE(SUM(${playerMatchScore.blowjobs}), 0)::int`,
      matchesPlayed: sql<number>`COUNT(DISTINCT ${playerMatchScore.matchId})::int`,
    })
    .from(player)
    .innerJoin(playerMatchScore, eq(player.id, playerMatchScore.playerId))
    .innerJoin(match, eq(playerMatchScore.matchId, match.id))
    .innerJoin(round, eq(match.roundId, round.id))
    .where(eq(round.seasonId, seasonId))
    .groupBy(player.id, player.name)
    .orderBy(
      desc(sql`SUM(${playerMatchScore.score})`),
      desc(sql`SUM(${playerMatchScore.blowjobs})`)
    );
}

export type TeamStanding = {
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  cupsScored: number;
  cupsConceded: number;
  cupDiff: number;
  points: number;
};

// 4. Tabulka týmů pro konkrétní kolo / turnajový večer
export async function getRoundTeamStandings(
  roundId: number
): Promise<TeamStanding[]> {
  const matches = await db
    .select({
      matchId: match.id,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
    })
    .from(match)
    .where(eq(match.roundId, roundId));

  return calculateStandings(matches);
}

// 5. Celková ligová tabulka týmů pro celou sezónu / semestr (součet za všech 5 kol)
export async function getSeasonTeamStandings(
  seasonId: number
): Promise<TeamStanding[]> {
  const matches = await db
    .select({
      matchId: match.id,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
    })
    .from(match)
    .innerJoin(round, eq(match.roundId, round.id))
    .where(eq(round.seasonId, seasonId));

  return calculateStandings(matches);
}

// Pomocná funkce pro výpočet ligové tabulky (2 body výhra, 1 remíza, 0 prohra)
async function calculateStandings(
  matches: {
    matchId: number;
    team1Id: number;
    team2Id: number;
    team1Score: number;
    team2Score: number;
  }[]
): Promise<TeamStanding[]> {
  const allTeams = await db.select().from(team);
  const teamMap = new Map<number, string>(allTeams.map((t) => [t.id, t.name]));

  const standingsMap = new Map<number, TeamStanding>();

  for (const m of matches) {
    if (!standingsMap.has(m.team1Id)) {
      standingsMap.set(m.team1Id, {
        teamId: m.team1Id,
        teamName: teamMap.get(m.team1Id) ?? `Tým #${m.team1Id}`,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        cupsScored: 0,
        cupsConceded: 0,
        cupDiff: 0,
        points: 0,
      });
    }

    if (!standingsMap.has(m.team2Id)) {
      standingsMap.set(m.team2Id, {
        teamId: m.team2Id,
        teamName: teamMap.get(m.team2Id) ?? `Tým #${m.team2Id}`,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        cupsScored: 0,
        cupsConceded: 0,
        cupDiff: 0,
        points: 0,
      });
    }

    const t1 = standingsMap.get(m.team1Id)!;
    const t2 = standingsMap.get(m.team2Id)!;

    t1.played += 1;
    t2.played += 1;

    t1.cupsScored += m.team1Score;
    t1.cupsConceded += m.team2Score;

    t2.cupsScored += m.team2Score;
    t2.cupsConceded += m.team1Score;

    if (m.team1Score > m.team2Score) {
      t1.wins += 1;
      t1.points += 2;
      t2.losses += 1;
    } else if (m.team1Score < m.team2Score) {
      t2.wins += 1;
      t2.points += 2;
      t1.losses += 1;
    } else {
      t1.draws += 1;
      t1.points += 1;
      t2.draws += 1;
      t2.points += 1;
    }
  }

  const list = Array.from(standingsMap.values());

  for (const t of list) {
    t.cupDiff = t.cupsScored - t.cupsConceded;
  }

  return list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.cupDiff !== a.cupDiff) return b.cupDiff - a.cupDiff;
    return b.cupsScored - a.cupsScored;
  });
}

export interface PlayerDetailData {
  player: {
    id: number;
    name: string;
    seasonId: number;
  };
  stats: {
    totalScore: number;
    totalBlowjobs: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
  teamsPlayedFor: string[];
  matchHistory: {
    matchId: number;
    roundName: string;
    roundNumber: number;
    teamName: string;
    opponentName: string;
    teamScore: number;
    opponentScore: number;
    playerScore: number;
    playerBlowjobs: number;
    result: "W" | "D" | "L";
  }[];
}

export async function getPlayerDetailStats(
  playerId: number
): Promise<PlayerDetailData | null> {
  const p = await db
    .select()
    .from(player)
    .where(eq(player.id, playerId))
    .limit(1);

  if (!p || p.length === 0) return null;

  // Zápasy hráče s individuálním výkonem
  const scores = await db
    .select({
      matchId: match.id,
      roundId: match.roundId,
      roundName: round.name,
      roundNumber: round.roundNumber,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      playerTeamId: playerMatchScore.teamId,
      playerScore: playerMatchScore.score,
      playerBlowjobs: playerMatchScore.blowjobs,
    })
    .from(playerMatchScore)
    .innerJoin(match, eq(playerMatchScore.matchId, match.id))
    .innerJoin(round, eq(match.roundId, round.id))
    .where(eq(playerMatchScore.playerId, playerId))
    .orderBy(desc(round.roundNumber), desc(match.id));

  // Týmy v sezóně pro zjištění názvů
  const seasonTeams = await db
    .select()
    .from(team)
    .where(eq(team.seasonId, p[0].seasonId));
  const teamMap = new Map(seasonTeams.map((t) => [t.id, t.name]));

  let totalScore = 0;
  let totalBlowjobs = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;

  const matchHistory = scores.map((s) => {
    totalScore += s.playerScore;
    totalBlowjobs += s.playerBlowjobs;

    const isTeam1 = s.playerTeamId === s.team1Id;
    const teamScore = isTeam1 ? s.team1Score : s.team2Score;
    const oppScore = isTeam1 ? s.team2Score : s.team1Score;
    const oppId = isTeam1 ? s.team2Id : s.team1Id;

    let result: "W" | "D" | "L" = "D";
    if (teamScore > oppScore) {
      result = "W";
      wins += 1;
    } else if (teamScore < oppScore) {
      result = "L";
      losses += 1;
    } else {
      draws += 1;
    }

    return {
      matchId: s.matchId,
      roundName: s.roundName,
      roundNumber: s.roundNumber,
      teamName: teamMap.get(s.playerTeamId) ?? `Tým #${s.playerTeamId}`,
      opponentName: teamMap.get(oppId) ?? `Tým #${oppId}`,
      teamScore,
      opponentScore: oppScore,
      playerScore: s.playerScore,
      playerBlowjobs: s.playerBlowjobs,
      result,
    };
  });

  // Týmy, za které byl hráč registrován v soupisce
  const rosters = await db
    .select({
      teamName: team.name,
    })
    .from(teamPlayer)
    .innerJoin(team, eq(teamPlayer.teamId, team.id))
    .where(eq(teamPlayer.playerId, playerId));

  const teamsPlayedFor = Array.from(
    new Set([
      ...rosters.map((r) => r.teamName),
      ...matchHistory.map((m) => m.teamName),
    ])
  );

  return {
    player: p[0],
    stats: {
      totalScore,
      totalBlowjobs,
      matchesPlayed: matchHistory.length,
      wins,
      losses,
      draws,
    },
    teamsPlayedFor,
    matchHistory,
  };
}

export interface TeamDetailData {
  team: {
    id: number;
    name: string;
    seasonId: number;
  };
  standings?: TeamStanding;
  rosterHistory: {
    roundId: number;
    roundName: string;
    roundNumber: number;
    players: string[];
  }[];
  matchHistory: {
    matchId: number;
    roundName: string;
    roundNumber: number;
    opponentName: string;
    teamScore: number;
    opponentScore: number;
    result: "W" | "D" | "L";
  }[];
}

export async function getTeamDetailStats(
  teamId: number
): Promise<TeamDetailData | null> {
  const t = await db
    .select()
    .from(team)
    .where(eq(team.id, teamId))
    .limit(1);

  if (!t || t.length === 0) return null;

  // Celková ligová tabulka sezóny pro tento tým
  const seasonStandings = await getSeasonTeamStandings(t[0].seasonId);
  const teamStandings = seasonStandings.find((s) => s.teamId === teamId);

  // Všechny týmy pro názvy
  const seasonTeams = await db
    .select()
    .from(team)
    .where(eq(team.seasonId, t[0].seasonId));
  const teamMap = new Map(seasonTeams.map((item) => [item.id, item.name]));

  // Zápasy týmu v sezóně
  const matches = await db
    .select({
      matchId: match.id,
      roundId: match.roundId,
      roundName: round.name,
      roundNumber: round.roundNumber,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
    })
    .from(match)
    .innerJoin(round, eq(match.roundId, round.id))
    .where(
      and(
        eq(round.seasonId, t[0].seasonId),
        or(eq(match.team1Id, teamId), eq(match.team2Id, teamId))
      )
    )
    .orderBy(desc(round.roundNumber), desc(match.id));

  const matchHistory = matches.map((m) => {
    const isTeam1 = m.team1Id === teamId;
    const teamScore = isTeam1 ? m.team1Score : m.team2Score;
    const oppScore = isTeam1 ? m.team2Score : m.team1Score;
    const oppId = isTeam1 ? m.team2Id : m.team1Id;

    let result: "W" | "D" | "L" = "D";
    if (teamScore > oppScore) result = "W";
    else if (teamScore < oppScore) result = "L";

    return {
      matchId: m.matchId,
      roundName: m.roundName,
      roundNumber: m.roundNumber,
      opponentName: teamMap.get(oppId) ?? `Tým #${oppId}`,
      teamScore,
      opponentScore: oppScore,
      result,
    };
  });

  // Soupisky v jednotlivých kolech
  const rosters = await db
    .select({
      roundId: round.id,
      roundName: round.name,
      roundNumber: round.roundNumber,
      playerName: player.name,
    })
    .from(teamPlayer)
    .innerJoin(round, eq(teamPlayer.roundId, round.id))
    .innerJoin(player, eq(teamPlayer.playerId, player.id))
    .where(eq(teamPlayer.teamId, teamId))
    .orderBy(asc(round.roundNumber));

  const rosterMap = new Map<
    number,
    { roundId: number; roundName: string; roundNumber: number; players: string[] }
  >();

  for (const r of rosters) {
    if (!rosterMap.has(r.roundId)) {
      rosterMap.set(r.roundId, {
        roundId: r.roundId,
        roundName: r.roundName,
        roundNumber: r.roundNumber,
        players: [],
      });
    }
    rosterMap.get(r.roundId)!.players.push(r.playerName);
  }

  return {
    team: t[0],
    standings: teamStandings,
    rosterHistory: Array.from(rosterMap.values()),
    matchHistory,
  };
}
