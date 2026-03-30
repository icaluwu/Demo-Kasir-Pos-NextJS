import { prisma } from "@/lib/prisma";
import { formatDateTime, formatIdr } from "@/lib/format";

export default async function PenjualanPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      lines: {
        include: { product: { select: { sku: true, name: true } } },
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Riwayat penjualan</h1>
        <p className="mt-1 text-sm text-zinc-400">
          50 transaksi terakhir beserta detail baris.
        </p>
      </div>

      <div className="space-y-6">
        {sales.map((s) => (
          <article
            key={s.id}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-4 py-3">
              <div>
                <p className="font-mono text-sm text-amber-200/90">{s.invoiceNo}</p>
                <p className="text-xs text-zinc-500">{formatDateTime(s.createdAt)}</p>
              </div>
              <p className="text-lg font-semibold tabular-nums text-zinc-100">
                {formatIdr(Number(s.total))}
              </p>
            </header>
            <ul className="divide-y divide-zinc-800/80">
              {s.lines.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"
                >
                  <div>
                    <span className="font-mono text-xs text-zinc-500">
                      {l.product.sku}
                    </span>
                    <p className="text-zinc-200">{l.product.name}</p>
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    {l.qty} × {formatIdr(Number(l.unitPrice))}
                    <span className="ml-2 tabular-nums text-zinc-200">
                      {formatIdr(Number(l.subtotal))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
        {!sales.length && (
          <p className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-zinc-500">
            Belum ada penjualan.
          </p>
        )}
      </div>
    </div>
  );
}
