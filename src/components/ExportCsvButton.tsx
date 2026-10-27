"use client";

import { useToast } from "@/hooks/use-toast";
import { downloadCSVFile, escapeCSV } from "@/lib/csv";
import { Download } from "lucide-react";

interface TeamStandingItem {
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

interface LeaderboardItem {
  playerName: string;
  totalScore?: number;
  totalBlowjobs?: number;
}

interface ExportCsvButtonProps {
  roundName: string;
  standings?: TeamStandingItem[];
  scoreLeaderboard?: LeaderboardItem[];
  bjLeaderboard?: LeaderboardItem[];
}

export function ExportCsvButton({
  roundName,
  standings = [],
  scoreLeaderboard = [],
  bjLeaderboard = [],
}: ExportCsvButtonProps) {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const lines: string[] = [];

      // 1. Pořadí týmů
      lines.push("Pořadí týmů");
      lines.push("Pořadí,Tým,Zápasy,Výhry,Remízy,Prohry,Body");
      standings.forEach((t, idx) => {
        lines.push(
          `${idx + 1},${escapeCSV(t.teamName)},${t.played},${t.wins},${t.draws},${t.losses},${t.points}`
        );
      });

      lines.push("");

      // 2. Střelci
      lines.push("Střelci");
      lines.push("Pořadí,Hráč,Body");
      scoreLeaderboard.forEach((p, idx) => {
        lines.push(
          `${idx + 1},${escapeCSV(p.playerName)},${p.totalScore ?? 0}`
        );
      });

      lines.push("");

      // 3. Král vyfouknutí (BJ)
      lines.push("Král vyfouknutí");
      lines.push("Pořadí,Hráč,Počet");
      bjLeaderboard.forEach((p, idx) => {
        lines.push(
          `${idx + 1},${escapeCSV(p.playerName)},${p.totalBlowjobs ?? 0}`
        );
      });

      const csvContent = lines.join("\r\n");
      const safeName = roundName
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-");
      const filename = `${safeName}-vysledky.csv`;

      downloadCSVFile(csvContent, filename);

      toast({
        title: "CSV export stažen",
        description: `Výsledky ${roundName} byly staženy do ${filename}`,
      });
    } catch (err: any) {
      toast({
        title: "Chyba při exportu",
        description: err?.message || "Export se nezdařil.",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="btn btn-outline btn-sm text-xs gap-1.5"
      title="Exportovat výsledky kola do CSV"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Export CSV</span>
    </button>
  );
}
