import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-3 sm:p-6 md:p-12 bg-base-200 text-base-content">
      <main className="max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-base-content">
            O aplikaci
          </h1>
          <p className="text-base-content/70 mt-1 text-sm sm:text-base">
            Oficiální organizační systém turnajů SPPDF Beerpong
          </p>
        </div>

        {/* Autoři a původ projektu */}
        <section className="card bg-base-100 border border-base-300 p-4 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-base-content">
              Autoři a vývoj aplikace
            </h2>
            <p className="text-base-content/80 text-sm sm:text-base leading-relaxed">
              Autory aplikace je IT divize spolku SPPDF MUNI. Systém slouží pro správu semestrů,
              turnajových večerů, rozpisu stolů a živých výsledků beerpongové ligy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-base-200/60 p-4 rounded-xl border border-base-300">
              <p className="font-bold text-sm text-base-content">Tadeáš Kozub</p>
              <p className="text-xs text-base-content/60">Spoluautor</p>
            </div>

            <div className="bg-base-200/60 p-4 rounded-xl border border-base-300">
              <p className="font-bold text-sm text-base-content">Petr Hýbl</p>
              <p className="text-xs text-base-content/60">Zakladatel a spoluautor</p>
            </div>

            <div className="bg-base-200/60 p-4 rounded-xl border border-base-300">
              <p className="font-bold text-sm text-base-content">Štěpán Řihák</p>
              <p className="text-xs text-base-content/60">Spoluautor</p>
            </div>
          </div>

          <div className="border-t border-base-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs sm:text-sm text-base-content/70">
            <div>
              Vytvořeno v <strong>říjnu 2024</strong> (první verze 2. října 2024).
            </div>

            <div>
              Původní repozitář:{" "}
              <a
                href="https://github.com/petrsgamer/beerpong-table"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                petrsgamer/beerpong-table
              </a>
            </div>
          </div>
        </section>

        {/* Odkaz na Design System */}
        <section className="card bg-base-100 border border-base-300 p-4 sm:p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-base-content">
                Design systém
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
                Specifikace barevných témat, designových tokenů, komponent a typografie.
              </p>
            </div>
            <Link
              href="/design-system"
              className="text-primary hover:underline font-semibold text-sm sm:text-base shrink-0"
            >
              Přejít na design systém →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
