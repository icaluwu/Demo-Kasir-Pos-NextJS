import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSession();
  if (session.isLoggedIn) redirect("/");

  const params = await searchParams;
  const err = params.error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-xl shadow-amber-950/20 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
          Ical&apos;s Demo POS
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Masuk admin</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Demo untuk klien — deploy di Vercel + database Postgres (mis. Neon).
        </p>

        {err === "auth" && (
          <p className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            Username atau password salah.
          </p>
        )}
        {err === "config" && (
          <p className="mt-4 rounded-lg border border-amber-900/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
            ADMIN_USERNAME / ADMIN_PASSWORD belum diatur di environment.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none ring-amber-500/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none ring-amber-500/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/panduan" className="text-amber-400/90 hover:text-amber-300">
            Lihat panduan singkat
          </Link>
        </p>
      </div>
    </div>
  );
}
