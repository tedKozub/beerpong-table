"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { downloadCSVFile, escapeCSV } from "@/lib/csv";
import {
  generateAndDownloadXlsx,
  TeamStandingItem,
  LeaderboardItem,
} from "@/lib/exportXlsx";
import { Download, FileSpreadsheet, ChevronDown, Check } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Zavření dropdownu při kliknutí mimo komponentu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-outline btn-sm text-xs gap-1.5 font-medium"
        title="Stáhnout výsledky ve formátu Excel nebo CSV"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Download className="h-3.5 w-3.5" />
        <span>Exportovat výsledky</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-base-100 p-1 shadow-xl border border-base-200 z-50 animate-in fade-in zoom-in-95">
          {/* 1. Excel XLSX */}
          <button
            type="button"
            onClick={() => {
              handleExportXlsx();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-base-200 text-left transition-colors font-semibold text-xs text-base-content"
          >
            <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
            <span>Excel (.xlsx)</span>
          </button>

          {/* 2. CSV */}
          <button
            type="button"
            onClick={() => {
              handleExportCsv();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-base-200 text-left transition-colors font-semibold text-xs text-base-content"
          >
            <Download className="h-4 w-4 text-base-content/70 shrink-0" />
            <span>CSV (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Re-export alias pro jednotné pojmenování
export { ExportCsvButton as ExportResultsButton };
