"use client";

import { createTournament } from "@/app/(admin)/new/action";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [tournamentName, setTournament] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await createTournament(formData);
    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage("Turnaj byl úspěšně vytvořen");
      setTournament("");
    }
  }

  return (
    <div className="flex-1 flex justify-center items-center py-16 px-4 bg-base-200 text-base-content">
      <main className="card bg-base-100 p-8 rounded-2xl border border-base-300 shadow-xl max-w-md mx-auto w-full">
        <Link
          href="/"
          className="text-xs font-semibold text-primary hover:underline mb-4 inline-block"
        >
          ← Zpět na seznam turnajů
        </Link>
        <h1 className="text-2xl font-black mb-4 text-base-content tracking-tight">
          Vytvořit nový turnaj
        </h1>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <label className="form-control w-full">
            <span className="label-text font-semibold text-base-content mb-1">
              Název turnaje
            </span>
            <input
              type="text"
              name="tournamentName"
              value={tournamentName}
              onChange={(e) => setTournament(e.target.value)}
              placeholder="Např. Podzimní Beer Pong Cup"
              className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary w-full font-bold">
            Vytvořit turnaj
          </button>
        </form>
        {message && (
          <div
            className={`alert mt-4 py-2 text-sm ${
              message.includes("chyba") || message.includes("error")
                ? "alert-error"
                : "alert-success"
            }`}
          >
            {message}
          </div>
        )}
      </main>
    </div>
  );
}
