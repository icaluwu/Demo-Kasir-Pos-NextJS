import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatIdr } from "@/lib/format";

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const [productCount, lowStock, todaySalesAgg, weekSales] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({
      where: { active: true, stockQty: { lt: 10 } },
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: weekStart,
        },
      },
      _sum: { total: true },
    }),
  ]);

  const todayTotal = Number(todaySalesAgg._sum.total ?? 0);
  const weekTotal = Number(weekSales._sum.total ?? 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Ringkasan stok dan penjualan untuk demo klien.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="SKU aktif"
          value={String(productCount)}
          hint="Master barang"
        />
        <StatCard
          label="Stok &lt; 10"
          value={String(lowStock)}
          hint="Perlu restock"
          accent
        />
        <StatCard
          label="Penjualan hari ini"
          value={formatIdr(todayTotal)}
          hint={`${todaySalesAgg._count} transaksi`}
        />
        <StatCard
          label="7 hari terakhir"
          value={formatIdr(weekTotal)}
          hint="Akumulasi"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/pos"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Buka kasir (POS)
        </Link>
        <Link
          href="/master"
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-amber-500/50 hover:text-amber-200"
        >
          Master &amp; impor CSV
        </Link>
        <Link
          href="/stok"
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-amber-500/50 hover:text-amber-200"
        >
          Stok masuk / keluar
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        accent
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-50">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
