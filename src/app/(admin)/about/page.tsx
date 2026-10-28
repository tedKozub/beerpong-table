import { Palette, ShieldAlert, Trophy, Users, Calendar, ArrowRight } from "lucide-react";
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
            🦊 O aplikaci & Pravidla ligy
          </h1>
          <p className="text-base-content/70 mt-1 text-sm sm:text-base">
            Oficiální organizační systém turnajů SPPDF Beerpong
          </p>
        </div>

        {/* Pravidla turnaje */}
        <section className="card bg-base-100 border-2 border-warning/50 p-4 sm:p-8 rounded-2xl shadow-md">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="p-4 bg-warning/15 text-warning rounded-2xl shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="badge badge-warning font-bold text-xs px-2.5 py-1">
                  Pravidla ligy
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-base-content">
                Upravená pravidla SPPDF Beerpong
              </h2>
              <p className="text-base-content/85 text-base leading-relaxed">
                Oficiální upravená pravidla SPPDF pro aktuální sezónu se v současnosti finalizují a brzy budou v plném znění doplněna přímo sem.
              </p>
              <div className="bg-base-200/80 rounded-xl p-4 border border-base-300 text-sm space-y-1.5 text-base-content/80">
                <p className="font-semibold text-base-content">Pravidla specificky upravují:</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-base-content/70">
                  <li>Pravidla obrany a vyfukování míčků (BlowJob obrana).</li>
                  <li>Systém střídání a dynamického nasazení hráčů do týmů.</li>
                  <li>Bodování zápasů a kritéria pořadí v ligové tabulce.</li>
                  <li>Fair play a technické postupy při sporných hodech.</li>
                </ul>
              </div>
            </div>
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
