"use server";

import { getSession } from "@/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNav } from "@/components/UserNav";
import { HelpCircle } from "lucide-react";
import Link from "next/link";

export const Navbar = async () => {
  const session = await getSession();
  return (
    <div className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300 px-4 transition-colors">
      <div className="flex-1 flex items-center gap-3 sm:gap-4">
        <Link href="/" className="btn btn-ghost text-xl font-black tracking-tight text-base-content">
          🦊 SPPDF BeerPong
        </Link>
        <Link
          href="/seasons"
          className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content hidden sm:inline-flex"
        >
          Semestry & Archiv
        </Link>
        <Link
          href="/public"
          className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content hidden sm:inline-flex"
        >
          Veřejné výsledky
        </Link>
        <Link
          href="/about"
          className="btn btn-ghost btn-sm text-xs font-semibold text-base-content/80 hover:text-base-content gap-1.5 hidden sm:inline-flex"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          O lize & Pravidla
        </Link>
      </div>

      <div className="navbar-end flex items-center gap-2 sm:gap-3">
        {/* Přepínač motivů Light/Dark/Auto */}
        <ThemeToggle />

        {/* Profil / Přihlášení / Odhlášení přes Popover */}
        <UserNav session={session ?? null} />
      </div>
    </div>
  );
};
