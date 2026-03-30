import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction, requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/master", label: "Master barang" },
  { href: "/stok", label: "Stok" },
  { href: "/pos", label: "Kasir (POS)" },
  { href: "/penjualan", label: "Penjualan" },
  { href: "/panduan", label: "Panduan" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/90 px-3 py-6 md:flex">
        <div className="px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/90">
            Ical&apos;s Demo POS
          </p>
          <p className="mt-1 truncate text-sm font-medium text-zinc-200">
            {session.username}
          </p>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800/80 hover:text-amber-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-4 w-full rounded-lg border border-zinc-700 px-3 py-2 text-left text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Keluar
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-800 bg-zinc-950/80 px-2 py-2 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Demo POS
            </span>
            <form action={logoutAction}>
              <button type="submit" className="text-xs text-zinc-400">
                Keluar
              </button>
            </form>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
