import ExcelJS from "exceljs";

export interface TeamStandingItem {
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  cupsScored?: number;
  cupsConceded?: number;
  cupDiff?: number;
  points: number;
}

export interface LeaderboardItem {
  playerName: string;
  totalScore?: number;
  totalBlowjobs?: number;
  matchesPlayed?: number;
}

export interface ExportData {
  title: string;
  standings?: TeamStandingItem[];
  scoreLeaderboard?: LeaderboardItem[];
  bjLeaderboard?: LeaderboardItem[];
}

export async function generateAndDownloadXlsx(data: ExportData): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SPPDF Beerpong";
  wb.created = new Date();

  // 1. List: Pořadí týmů
  if (data.standings && data.standings.length > 0) {
    const ws = wb.addWorksheet("Pořadí týmů");
    ws.columns = [
      { header: "Pořadí", key: "rank", width: 10 },
      { header: "Tým", key: "teamName", width: 28 },
      { header: "Zápasy", key: "played", width: 12 },
      { header: "Výhry", key: "wins", width: 10 },
      { header: "Remízy", key: "draws", width: 10 },
      { header: "Prohry", key: "losses", width: 10 },
      ...(data.standings.some((t) => t.cupsScored !== undefined)
        ? [
            { header: "Skóre +", key: "cupsScored", width: 12 },
            { header: "Skóre -", key: "cupsConceded", width: 12 },
            { header: "Rozdíl", key: "cupDiff", width: 10 },
          ]
        : []),
      { header: "Body", key: "points", width: 10 },
    ];
    ws.getRow(1).font = { bold: true };

    data.standings.forEach((t, idx) => {
      ws.addRow({
        rank: idx + 1,
        teamName: t.teamName,
        played: t.played,
        wins: t.wins,
        draws: t.draws,
        losses: t.losses,
        cupsScored: t.cupsScored,
        cupsConceded: t.cupsConceded,
        cupDiff: t.cupDiff,
        points: t.points,
      });
    });
  }

  // 2. List: Střelci (Král střelců)
  if (data.scoreLeaderboard && data.scoreLeaderboard.length > 0) {
    const ws = wb.addWorksheet("Střelci");
    ws.columns = [
      { header: "Pořadí", key: "rank", width: 10 },
      { header: "Hráč", key: "playerName", width: 28 },
      { header: "Kelímky", key: "totalScore", width: 14 },
      { header: "Zápasy", key: "matchesPlayed", width: 14 },
    ];
    ws.getRow(1).font = { bold: true };

    data.scoreLeaderboard.forEach((p, idx) => {
      ws.addRow({
        rank: idx + 1,
        playerName: p.playerName,
        totalScore: p.totalScore ?? 0,
        matchesPlayed: p.matchesPlayed ?? "-",
      });
    });
  }

  // 3. List: BlowJob King
  if (data.bjLeaderboard && data.bjLeaderboard.length > 0) {
    const ws = wb.addWorksheet("BlowJob King");
    ws.columns = [
      { header: "Pořadí", key: "rank", width: 10 },
      { header: "Hráč", key: "playerName", width: 28 },
      { header: "Vyfouknuto", key: "totalBlowjobs", width: 14 },
      { header: "Zápasy", key: "matchesPlayed", width: 14 },
    ];
    ws.getRow(1).font = { bold: true };

    data.bjLeaderboard.forEach((p, idx) => {
      ws.addRow({
        rank: idx + 1,
        playerName: p.playerName,
        totalBlowjobs: p.totalBlowjobs ?? 0,
        matchesPlayed: p.matchesPlayed ?? "-",
      });
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-");
  link.href = url;
  link.download = `${safeName}-vysledky.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
