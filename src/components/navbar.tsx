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
    <div className="navbar sticky top-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-300 px-3 sm:px-6 transition-colors">
      <div className="flex-1 flex items-center gap-2 sm:gap-4 flex-wrap">
        <Link
          href="/"
          className="btn btn-ghost text-lg sm:text-xl font-black tracking-tight text-base-content px-1 sm:px-2"
        >
          🦊 SPPDF BeerPong
        </Link>

        {/* Přepínač semestrů ve stylu MUNI IS */}
        {seasons.length > 0 && (
          <SeasonSelector
            seasons={seasons}
            currentSeasonId={activeSeason?.id}
          />
        )}

        <Link
          href="/public"
          className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content hidden md:inline-flex"
        >
          Veřejné výsledky
        </Link>
        <Link
          href="/seasons"
          className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content hidden lg:inline-flex"
        >
          Správa semestrů
        </Link>
        <Link
          href="/about"
          className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content hidden sm:inline-flex"
        >
          O lize & Pravidla
        </Link>
      </div>

      <div className="navbar-end flex items-center gap-2">
        <ThemeToggle />
        <UserNav session={session ?? null} />
      </div>
    </div>
  );
};
