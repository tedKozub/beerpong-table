"use server";

import { getSession } from "@/actions/auth";
import { getActiveSeason, getAllSeasons } from "@/actions/seasons";
import { SeasonSelector } from "@/components/SeasonSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNav } from "@/components/UserNav";
import Link from "next/link";

export const Navbar = async () => {
  const [session, seasons, activeSeason] = await Promise.all([
    getSession(),
    getAllSeasons(),
    getActiveSeason(),
  ]);

  return (
    <div className="navbar sticky top-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-300 px-2 sm:px-6 transition-colors flex-nowrap">
      <div className="flex-1 flex items-center gap-1 sm:gap-4 flex-nowrap min-w-0">
        <Link
          href="/"
          className="btn btn-ghost text-base sm:text-xl font-black tracking-tight text-base-content px-1 sm:px-2 shrink-0"
        >
          <span className="sm:hidden">🦊 SPPDF</span>
          <span className="hidden sm:inline">🦊 SPPDF Beerpong</span>
        </Link>

        {/* Přepínač semestrů ve stylu MUNI IS */}
        {seasons.length > 0 && (
          <div className="shrink-0 max-w-[110px] sm:max-w-none">
            <SeasonSelector
              seasons={seasons}
              currentSeasonId={activeSeason?.id}
            />
          </div>
        )}

        <Link
          href="/about"
          className="btn btn-ghost btn-xs sm:btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content shrink-0 px-2"
        >
          About
        </Link>

        <Link
          href="/public"
          className="btn btn-ghost btn-xs sm:btn-sm text-xs font-semibold text-base-content/70 hover:text-base-content shrink-0 gap-1 px-2"
          title="Přepnout na veřejné výsledky"
        >
          <span className="hidden sm:inline">Veřejné výsledky</span>
          <span className="sm:hidden">Veřejné</span>
          <span className="text-[10px] opacity-60">↗</span>
        </Link>
      </div>

      <div className="navbar-end flex items-center gap-1 sm:gap-2 shrink-0">
        <ThemeToggle />
        <UserNav session={session ?? null} />
      </div>
    </div>
  );
};
