import {
  Palette,
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Github,
  Code2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-3 sm:p-6 md:p-12 bg-base-200 text-base-content">
      <main className="max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-primary hover:underline mb-2 inline-block"
          >
            ← Zpět na přehled
          </Link>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-base-content">
            🦊 O aplikaci
          </h1>
          <p className="text-base-content/70 mt-1 text-sm sm:text-base">
            Oficiální organizační systém turnajů SPPDF Beerpong
          </p>
        </div>

        {/* Autoři a původ projektu */}
        <section className="card bg-base-100 border border-base-300 p-4 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <div className="p-3.5 bg-primary/10 text-primary rounded-2xl shrink-0">
              <Code2 className="w-7 h-7" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="inline-flex items-center gap-2">
                <span className="badge badge-primary font-bold text-xs px-2.5 py-1">
                  Tvůrci & Původ
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-base-content">
                Autoři & Vývoj aplikace
              </h2>
              <p className="text-base-content/80 text-sm sm:text-base leading-relaxed">
                Systém pro správu semestrů, turnajových večerů a živých výsledků beerpongové ligy SPPDF.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-base-200/60 p-4 rounded-xl border border-base-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                TK
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-base-content truncate">Tadeáš Kozub</p>
                <p className="text-xs text-base-content/60">Spoluautor</p>
              </div>
            </div>

            <div className="bg-base-200/60 p-4 rounded-xl border border-base-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                PH
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-base-content truncate">Petr Hýbl</p>
                <p className="text-xs text-base-content/60">Zakladatel & Spoluautor</p>
              </div>
            </div>

            <div className="bg-base-200/60 p-4 rounded-xl border border-base-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                ŠŘ
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-base-content truncate">Štěpán Řihák</p>
                <p className="text-xs text-base-content/60">Spoluautor</p>
              </div>
            </div>
          </div>

          <div className="border-t border-base-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-base-content/70">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>Vytvořeno v <strong>říjnu 2024</strong> (první verze 2. října 2024)</span>
            </div>

            <a
              href="https://github.com/petrsgamer/beerpong-table"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-xs sm:btn-sm gap-2 font-semibold"
            >
              <Github className="w-4 h-4" />
              <span>Původní repo: petrsgamer/beerpong-table</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </section>

        {/* O systému & funkce */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-base-content">
            Klíčové funkce systému
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm space-y-2">
              <div className="p-2.5 bg-primary/10 text-primary w-fit rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-base-content">Rozpis a stoly</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Automatický generátor zápasů (round-robin) pro libovolný počet stolů s okamžitým přehledem aktuálního kola.
              </p>
            </div>

            <div className="card bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm space-y-2">
              <div className="p-2.5 bg-success/10 text-success w-fit rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-base-content">Týmy a hráči</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Zadávání zápasů v reálném čase včetně individuálního skóre střelců a BlowJob King statistik.
              </p>
            </div>

            <div className="card bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm space-y-2">
              <div className="p-2.5 bg-info/10 text-info w-fit rounded-xl">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-base-content">Výsledky a exporty</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Veřejná stránka s live výsledky bez nutnosti přihlášení, export rozpisu do PDF i 16:9 prezentace.
              </p>
            </div>
          </div>
        </section>

        {/* Sekce Design System */}
        <section className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-primary/10 text-primary rounded-2xl shrink-0">
                <Palette className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">
                  Design System & Komponenty
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
                  Přehled barevných témat (Light & Dark WCAG AAA), design tokenů, odznaků a typografie.
                </p>
              </div>
            </div>
            <Link
              href="/design-system"
              className="btn btn-primary btn-sm sm:btn-md gap-2 font-bold shrink-0 w-full sm:w-auto"
            >
              Prohlédnout Design System
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
