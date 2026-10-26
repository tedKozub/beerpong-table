"use server";
import { getTeamsForTournament } from "@/actions/teams";
import { ScoreInputTable } from "@/components/score_input_table";
import Link from "next/link";

export default async function Home(params: {
  params: { tournamentid: number };
  searchParams: { team1?: string; team2?: string };
}) {
  const teams = (await getTeamsForTournament(params.params.tournamentid)).sort(
    (a, b) => (a.name ?? "").localeCompare(b.name ?? "", "cs")
  );
  const initialTeam1Id = Number(params.searchParams.team1) || undefined;
  const initialTeam2Id = Number(params.searchParams.team2) || undefined;
  const fromSchedule = initialTeam1Id !== undefined;
  const tournamentHref = `/${params.params.tournamentid}`;

  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12 bg-base-200 text-base-content font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <Link href={tournamentHref} className="text-sm font-semibold text-primary hover:underline">
            ← Zpět na rozpis turnaje
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-base-content mt-2">
            Zadání výsledku zápasu
          </h1>
        </div>
        <ScoreInputTable
          teams={teams}
          tournamentId={params.params.tournamentid}
          initialTeam1Id={initialTeam1Id}
          initialTeam2Id={initialTeam2Id}
          returnTo={fromSchedule ? tournamentHref : undefined}
        />
      </main>
    </div>
  );
}
