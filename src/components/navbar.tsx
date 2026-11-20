"use server";

import { getSession } from "@/actions/auth";
import { getActiveSeason, getAllSeasons } from "@/actions/seasons";
import { SeasonSelector } from "@/components/SeasonSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNav } from "@/components/UserNav";
import { PublicNavbar } from "@/components/PublicNavbar";
import Link from "next/link";

export const Navbar = async () => {
  const [session, seasons, activeSeason] = await Promise.all([
    getSession(),
    getAllSeasons(),
    getActiveSeason(),
  ]);

  // Pokud uživatel není přihlášený administrátor (např. na /about nebo /login), zobrazíme veřejný read-only navbar
  if (!session?.userId) {
    return <PublicNavbar seasonName={activeSeason?.name} />;
  }

  return (
    <header className="sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-300 transition-colors">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Hlavní navigace vlevo */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-wrap">
          <Link
            href="/"
            className="btn btn-ghost text-base sm:text-xl font-black tracking-tight text-base-content px-1.5 sm:px-2 shrink-0"
            title="SPPDF Beerpong"
          >
            <span className="sm:hidden text-lg">🦊</span>
            <span className="hidden sm:inline">🦊 SPPDF Beerpong</span>
          </Link>

          {/* Tlačítka domů a správa ligy */}
          <Link
            href="/"
            className="btn btn-ghost btn-xs sm:btn-sm text-xs font-bold text-base-content hover:text-primary shrink-0 px-2"
            title="Přejít na hlavní přehled ligy a výsledky"
          >
            Přehled ligy
          </Link>

          <Link
            href="/seasons"
            className="btn btn-ghost btn-xs sm:btn-sm text-xs font-semibold text-base-content/85 hover:text-primary shrink-0 px-2"
            title="Správa ligy, semestrů, týmů a hráčů"
          >
            Správa ligy
          </Link>

          <Link
            href="/public"
            className="btn btn-ghost btn-xs sm:btn-sm text-xs font-semibold text-base-content/70 hover:text-base-content shrink-0 px-1.5 sm:px-2"
            title="Přepnout na veřejné výsledky"
          >
            <span className="hidden lg:inline">Veřejné výsledky</span>
            <span className="lg:hidden">Veřejné</span>
          </Link>

          <Link
            href="/about"
            className="btn btn-ghost btn-xs sm:btn-sm text-xs font-semibold text-base-content/70 hover:text-base-content shrink-0 px-1.5 sm:px-2 hidden sm:inline-flex"
            title="O lize a pravidla"
          >
            O lize
          </Link>
        </div>

        {/* Pravá část: přepínač semestru mimo hlavní navigační panely + Theme + Profil */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Přepínač semestrů ve stylu MUNI IS umístěný vpravo */}
          {seasons.length > 0 && (
            <div className="shrink-0">
              <SeasonSelector
                seasons={seasons}
                currentSeasonId={activeSeason?.id}
              />
            </div>
          )}

          <ThemeToggle />
          <UserNav session={session ?? null} />
        </div>
      </div>
    </header>
  );
};
