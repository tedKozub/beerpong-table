"use client";

import { useToast } from "@/hooks/use-toast";
import { downloadCSVFile, escapeCSV } from "@/lib/csv";
import { generateAndDownloadXlsx, TeamStandingItem, LeaderboardItem } from "@/lib/exportXlsx";
import { Download, FileSpreadsheet } from "lucide-react";

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

  const handleExportXlsx = async () => {
    try {
      await generateAndDownloadXlsx({
        title: roundName,
        standings,
        scoreLeaderboard,
        bjLeaderboard,
      });

      toast({
        title: "XLSX export stažen",
        description: `Výsledky ${roundName} byly uloženy do Excel tabulky (.xlsx).`,
      });
    } catch (err: any) {
      toast({
        title: "Chyba při exportu do XLSX",
        description: err?.message || "Export se nezdařil.",
        variant: "destructive",
      });
    }
  };

  const handleExportCsv = () => {
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

      // 3. BlowJob King
      lines.push("BlowJob King");
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
    <div className="join inline-flex shadow-sm">
      <button
        type="button"
        onClick={handleExportXlsx}
        className="btn btn-primary btn-sm text-xs gap-1.5 join-item font-semibold"
        title="Stáhnout výsledky v moderním Excel formátu (.xlsx)"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        <span>Stáhnout XLSX</span>
      </button>

      <button
        type="button"
        onClick={handleExportCsv}
        className="btn btn-outline btn-sm text-xs gap-1.5 join-item"
        title="Stáhnout výsledky v CSV formátu"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export CSV</span>
      </button>
    </div>
  );
}

// Re-export alias pro jednotné pojmenování
export { ExportCsvButton as ExportResultsButton };
