import {
  getAllSeasons,
  createSeason,
  deleteSeason,
  setActiveSeason,
} from "@/actions/seasons";
import { getRoundsForSeason } from "@/actions/rounds";
import Link from "next/link";

export default async function SeasonsArchivePage() {
  const seasons = await getAllSeasons();

  const seasonsWithRounds = await Promise.all(
    seasons.map(async (s) => ({
      ...s,
      rounds: await getRoundsForSeason(s.id),
    }))
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-300 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Sezóny & Archiv semestrů
          </h1>
          <p className="text-base-content/70 text-xs sm:text-sm mt-0.5">
            Přehled všech semestrů v historii BeerPong ligy
          </p>
        </div>
      </div>

      {/* Přehled semestrů */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seasonsWithRounds.map((s) => (
          <div
            key={s.id}
            className={`card border shadow-md transition-all ${
              s.isActive
                ? "bg-base-100 border-success/40 ring-1 ring-success/30"
                : "bg-base-100 border-base-300"
            }`}
          >
            <div className="card-body p-5 sm:p-6">
              <div className="flex justify-between items-start">
                <span
                  className={`badge ${
                    s.isActive ? "badge-success font-bold gap-1.5" : "badge-ghost"
                  } whitespace-nowrap text-xs`}
                >
                  {s.isActive && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  )}
                  {s.isActive ? "AKTIVNÍ SEMESTR" : "ARCHIV"}
                </span>
                <span className="text-xs text-base-content/60 font-semibold tabular-nums">
                  {s.rounds.length} turnajových kol
                </span>
              </div>

              <h2 className="card-title text-xl font-bold mt-2">{s.name}</h2>

              <p className="text-xs text-base-content/60 mb-3">
                Vytvořeno: {new Date(s.createdAt).toLocaleDateString("cs-CZ")}
              </p>

              {/* Rychlé náhledy kol */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {s.rounds.map((r) => (
                  <Link
                    key={r.id}
                    href={`/rounds/${r.id}`}
                    className={`badge badge-sm whitespace-nowrap ${
                      r.isCompleted
                        ? "badge-success/20 text-success-content border-success/30"
                        : "badge-ghost"
                    } hover:opacity-80 transition-opacity`}
                  >
                    {r.name}
                  </Link>
                ))}
              </div>

              <div className="card-actions justify-between items-center pt-3 border-t border-base-200">
                <div className="flex flex-wrap gap-2 items-center">
                  <Link
                    href={`/seasons/${s.id}`}
                    className="btn btn-primary btn-sm text-xs"
                  >
                    Otevřít semestr →
                  </Link>
                  {!s.isActive && (
                    <form
                      action={async () => {
                        "use server";
                        await setActiveSeason(s.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="btn btn-outline btn-success btn-sm text-xs"
                      >
                        Nastavit jako aktivní
                      </button>
                    </form>
                  )}
                </div>

                <form
                  action={async () => {
                    "use server";
                    await deleteSeason(s.id);
                  }}
                >
                  <button
                    type="submit"
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    title="Smazat celou sezónu"
                  >
                    Smazat
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulář pro založení nového semestru */}
      <section className="card bg-base-100 border border-base-300 shadow-md">
        <div className="card-body p-5 sm:p-6">
          <h2 className="card-title text-lg font-bold">Založit nový semestr</h2>
          <p className="text-xs text-base-content/70">
            Při založení semestru se pro něj automaticky vytvoří standardních 5 kol včetně Velkého Finále.
          </p>

          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const isActive = formData.get("isActive") === "on";
              if (name?.trim()) {
                await createSeason({
                  name: name.trim(),
                  isActive,
                });
              }
            }}
            className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-3"
          >
            <input
              name="name"
              placeholder="Např. Podzimní semestr 2026"
              className="input input-bordered input-sm w-full sm:w-80"
              required
            />
            <label className="label cursor-pointer gap-2 py-0">
              <input
                type="checkbox"
                name="isActive"
                className="checkbox checkbox-success checkbox-sm"
              />
              <span className="label-text text-xs font-semibold">
                Nastavit rovnou jako aktivní
              </span>
            </label>
            <button type="submit" className="btn btn-primary btn-sm">
              Vytvořit semestr (s 5 koly)
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
