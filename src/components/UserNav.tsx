import { logout } from "@/actions/auth";
import { LogOut, User, UserCheck } from "lucide-react";
import Link from "next/link";
import type { JWTPayload } from "jose";

interface UserNavProps {
  session?: (JWTPayload & { userId?: string | number }) | null;
}

export function UserNav({ session }: UserNavProps) {
  if (!session?.userId) {
    return (
      <Link
        href="/login"
        className="btn btn-ghost btn-sm btn-square border border-base-300 text-base-content/80 hover:text-base-content hover:bg-base-200"
        title="Přihlášení správce"
      >
        <User className="w-4 h-4" />
      </Link>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-square border border-success/40 text-success hover:bg-success/10 transition-colors"
        title={`Přihlášen jako správce (#${session.userId})`}
      >
        <UserCheck className="w-4 h-4" />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-[100] menu p-4 shadow-2xl bg-base-100 rounded-2xl w-60 border border-base-300 mt-2"
      >
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-base-200">
          <div className="w-9 h-9 rounded-full bg-success/15 text-success flex items-center justify-center font-black text-sm shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-base-content truncate">Správce ligy</p>
            <p className="text-xs text-base-content/60 truncate">ID #{String(session.userId)}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="btn btn-sm btn-outline btn-error w-full gap-2 font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        </form>
      </div>
    </div>
  );
}
