"use client";

import { useCallback, useMemo, useState } from "react";
import { checkoutAction, type CheckoutLine } from "@/app/actions/checkout";
import { formatIdr } from "@/lib/format";
import ProductSearchField, {
  type ProductLite,
} from "@/components/product-search-field";

type Line = { productId: string; sku: string; name: string; unitPrice: number; qty: number };

export default function PosClient() {
  const [lines, setLines] = useState<Line[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [searchKey, setSearchKey] = useState(0);

  const addProduct = useCallback((p: ProductLite | null) => {
    if (!p) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === p.id);
      if (i >= 0) {
        const next = [...prev];
        const row = next[i]!;
        next[i] = { ...row, qty: row.qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productId: p.id,
          sku: p.sku,
          name: p.name,
          unitPrice: p.sellPrice,
          qty: 1,
        },
      ];
    });
    setMsg(null);
    setSearchKey((k) => k + 1);
  }, []);

  const setQty = (productId: string, qty: number) => {
    const q = Math.max(1, Math.floor(qty));
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, qty: q } : l))
    );
  };

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  };

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
    [lines]
  );

  const checkout = async () => {
    setPending(true);
    setMsg(null);
    const payload: CheckoutLine[] = lines.map((l) => ({
      productId: l.productId,
      qty: l.qty,
    }));
    const res = await checkoutAction(payload);
    setPending(false);
    if (res.ok) {
      setLines([]);
      setMsg("Transaksi tersimpan.");
    } else {
      setMsg(res.error);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <h2 className="text-sm font-medium text-zinc-300">Cari &amp; tambah barang</h2>
        <ProductSearchField
          key={searchKey}
          namePrefix="pos"
          label="Scan ketik SKU / nama"
          onSelect={(p) => {
            addProduct(p);
          }}
        />
        <p className="text-xs text-zinc-500">
          Klik baris di hasil pencarian untuk menambah ke keranjang. Barang terpilih
          akan di-merge qty jika sama.
        </p>
      </div>

      <div className="lg:col-span-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Keranjang</h2>
          <span className="text-lg font-semibold tabular-nums text-amber-300">
            {formatIdr(total)}
          </span>
        </div>

        {msg && (
          <p
            className={`mt-2 rounded-lg px-3 py-2 text-sm ${
              msg === "Transaksi tersimpan."
                ? "border border-emerald-800 bg-emerald-950/40 text-emerald-200"
                : "border border-red-900 bg-red-950/40 text-red-200"
            }`}
          >
            {msg}
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {lines.map((l) => (
            <li
              key={l.productId}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-amber-200/90">{l.sku}</p>
                <p className="truncate text-sm text-zinc-200">{l.name}</p>
                <p className="text-xs text-zinc-500">{formatIdr(l.unitPrice)} / unit</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={l.qty}
                  onChange={(e) => setQty(l.productId, Number(e.target.value))}
                  className="w-16 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => removeLine(l.productId)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Hapus
                </button>
              </div>
              <div className="w-full text-right text-sm tabular-nums text-zinc-300 sm:w-28">
                {formatIdr(l.unitPrice * l.qty)}
              </div>
            </li>
          ))}
          {!lines.length && (
            <li className="rounded-lg border border-dashed border-zinc-800 py-10 text-center text-sm text-zinc-500">
              Keranjang kosong
            </li>
          )}
        </ul>

        <button
          type="button"
          disabled={pending || !lines.length}
          onClick={() => void checkout()}
          className="mt-6 w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-50 hover:bg-amber-400"
        >
          {pending ? "Menyimpan…" : "Bayar & simpan transaksi"}
        </button>
      </div>
    </div>
  );
}
