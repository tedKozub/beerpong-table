"use server";

import { getSession, login } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (session?.userId) {
    redirect("/");
  }

  return (
    <div className="flex-1 flex justify-center items-center py-8 sm:py-16 px-3 sm:px-4 bg-base-200 text-base-content">
      <form
        action={login}
        className="card bg-base-100 w-full max-w-sm mx-auto p-5 sm:p-8 rounded-2xl shadow-xl border border-base-300"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-base-content mb-1">
            Přihlášení
          </h1>
          <p className="text-xs text-base-content/60">
            Správa turnajů a zápasů SPPDF
          </p>
        </div>

        <div className="form-control mb-4">
          <label htmlFor="name" className="label py-1">
            <span className="label-text font-semibold text-base-content">Jméno</span>
          </label>
          <input
            id="name"
            name="name"
            placeholder="admin"
            className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
            required
          />
        </div>

        <div className="form-control mb-6">
          <label htmlFor="password" className="label py-1">
            <span className="label-text font-semibold text-base-content">Heslo</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full font-bold">
          Přihlásit se
        </button>
      </form>
    </div>
  );
}
