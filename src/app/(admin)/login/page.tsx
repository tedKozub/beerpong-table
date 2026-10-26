"use server";

import { getSession, login, logout } from "@/actions/auth";
import Link from "next/link";

export default async function Page() {
  const session = await getSession();

  if (session?.userId) {
    return (
      <div className="flex-1 flex justify-center items-center py-16 px-4 bg-base-200 text-base-content">
        <div className="card bg-base-100 p-8 rounded-2xl shadow-xl border border-base-300 text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            ✓
          </div>
          <h1 className="text-xl font-bold mb-2 text-base-content">
            Jste přihlášeni
          </h1>
          <p className="text-sm text-base-content/70 mb-6">
            Správce turnajů (ID #{String(session?.userId)})
          </p>
          <div className="space-y-3">
            <Link href="/" className="btn btn-primary w-full font-bold">
              Přejít na seznam turnajů
            </Link>
            <form action={logout}>
              <button type="submit" className="btn btn-outline btn-error w-full">
                Odhlásit se
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center items-center py-16 px-4 bg-base-200 text-base-content">
      <form
        action={login}
        className="card bg-base-100 w-full max-w-sm mx-auto p-8 rounded-2xl shadow-xl border border-base-300"
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
