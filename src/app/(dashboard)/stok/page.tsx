import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import StockInForm from "./stock-in-form";
import StockOutForm from "./stock-out-form";

export default async function StokPage() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { product: { select: { sku: true, name: true } } },
  });

  const typeLabel = (t: string) => {
    if (t === "IN") return "Masuk";
    if (t === "OUT_ADJ") return "Keluar (manual)";
    if (t === "OUT_SALE") return "Keluar (jual)";
    if (t === "ADJUST_IMPORT") return "Sesuai impor";
    return t;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Stok masuk &amp; keluar</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Mutasi di luar POS dicatat di sini. Penjualan kasir mengurangi stok otomatis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StockInForm />
        <StockOutForm />
      </div>

      <div>
        <h2 className="text-sm font-medium text-zinc-300">Riwayat mutasi (40 terakhir)</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Jenis</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {movements.map((m) => (
                <tr key={m.id} className="text-zinc-300">
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {formatDateTime(m.createdAt)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-amber-200/80">
                    {m.product.sku}
                  </td>
                  <td className="px-3 py-2 text-xs">{typeLabel(m.type)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.qty}</td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-xs text-zinc-500">
                    {m.note ?? "—"}
                  </td>
                </tr>
              ))}
              {!movements.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                    Belum ada mutasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
