import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

interface PublicNavbarProps {
  currentRoundId?: number;
  seasonName?: string;
}

export function PublicNavbar({ currentRoundId, seasonName }: PublicNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-300 transition-colors">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
          <Link
            href="/"
            className="btn btn-ghost text-base sm:text-xl font-black tracking-tight text-base-content px-1 sm:px-2 shrink-0"
            title="SPPDF Beerpong"
          >
            <span className="sm:hidden text-lg">🦊</span>
            <span className="hidden sm:inline">🦊 SPPDF Beerpong</span>
          </Link>

          {seasonName && (
            <span className="badge badge-neutral text-xs font-semibold max-w-[120px] sm:max-w-none truncate hidden sm:inline-flex">
              {seasonName}
            </span>
          )}

          <Link
            href="/about"
            className="btn btn-ghost btn-xs sm:btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content shrink-0 px-1.5 sm:px-2"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />
          <Link
            href={currentRoundId ? `/rounds/${currentRoundId}` : "/"}
            className="btn btn-primary btn-xs sm:btn-sm text-xs font-semibold"
          >
            Admin / Zápis
          </Link>
        </div>
      </div>
    </header>
  );
}
