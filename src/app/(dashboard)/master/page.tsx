import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatIdr } from "@/lib/format";
import ImportCsvForm from "./import-form";

type SearchParams = Promise<{ q?: string; page?: string }>;

const PAGE_SIZE = 30;

export default async function MasterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    active: true,
    ...(q
      ? {
          OR: [
            { sku: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { sku: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Master barang</h1>
          <p className="mt-1 text-sm text-zinc-400">
            ±10.000 SKU — gunakan pencarian &amp; impor CSV untuk setup awal.
          </p>
        </div>
        <Link
          href="/produk-import-template.csv"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Unduh template CSV
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-200">Impor / sinkron CSV</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Kolom: sku, name, category, brand, unit, costPrice, sellPrice, initialStock.
          SKU yang sudah ada akan di-update; stok disesuaikan ke initialStock dengan
          catatan mutasi.
        </p>
        <div className="mt-4">
          <ImportCsvForm />
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-2" method="get">
        <div>
          <label className="block text-xs text-zinc-500" htmlFor="q">
            Cari SKU / nama
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="contoh: SP-000042 atau seal"
            className="mt-1 w-full min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/50 sm:w-72"
          />
        </div>
        <input type="hidden" name="page" value="1" />
        <button
          type="submit"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Cari
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2 text-right">Jual</th>
              <th className="px-3 py-2 text-right">Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {rows.map((p) => (
              <tr key={p.id} className="text-zinc-200">
                <td className="px-3 py-2 font-mono text-xs text-amber-200/90">
                  {p.sku}
                </td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2 text-zinc-400">{p.category ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatIdr(Number(p.sellPrice))}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {p.stockQty} {p.unit}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-zinc-500">
                  Belum ada data — jalankan seed atau impor CSV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
        <span>
          Total {total} barang · halaman {page}/{totalPages}
        </span>
        <div className="flex gap-2">
          <PaginationLink page={page - 1} disabled={page <= 1} q={q} label="←" />
          <PaginationLink
            page={page + 1}
            disabled={page >= totalPages}
            q={q}
            label="→"
          />
        </div>
      </div>
    </div>
  );
}

function PaginationLink({
  page,
  disabled,
  q,
  label,
}: {
  page: number;
  disabled: boolean;
  q: string;
  label: string;
}) {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("page", String(page));
  const href = `/master?${qs.toString()}`;
  if (disabled) {
    return (
      <span className="rounded border border-zinc-800 px-3 py-1 opacity-40">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded border border-zinc-600 px-3 py-1 text-zinc-300 hover:border-amber-500/50"
    >
      {label}
    </Link>
  );
}
