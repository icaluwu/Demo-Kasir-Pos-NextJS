"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { stockOutAction } from "@/app/actions/stock";
import ProductSearchField from "@/components/product-search-field";

type S = { ok: true } | { ok: false; error: string } | null;

export default function StockOutForm() {
  const router = useRouter();
  const [pickKey, setPickKey] = useState(0);

  const [state, action, pending] = useActionState(
    async (_prev: S, fd: FormData) => {
      const res = await stockOutAction(fd);
      if (res.ok) {
        setPickKey((k) => k + 1);
        queueMicrotask(() => router.refresh());
      }
      return res;
    },
    null as S
  );

  return (
    <form
      action={action}
      className="space-y-4 rounded-xl border border-amber-900/40 bg-amber-950/15 p-4"
    >
      <h2 className="text-sm font-semibold text-amber-200">Stok keluar (non-penjualan)</h2>
      <ProductSearchField key={pickKey} namePrefix="out" label="Cari barang" />
      {state && !state.ok && (
        <p className="text-xs text-red-300">{state.error}</p>
      )}
      <div>
        <label className="block text-xs text-zinc-500" htmlFor="out-qty">
          Jumlah
        </label>
        <input
          id="out-qty"
          name="qty"
          type="number"
          min={1}
          required
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500" htmlFor="out-note">
          Keterangan (opsional)
        </label>
        <input
          id="out-note"
          name="note"
          placeholder="Rusak / sampling / pakai internal"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan keluar"}
      </button>
      {state?.ok && (
        <p className="text-xs text-amber-200/90">Stok keluar tersimpan.</p>
      )}
    </form>
  );
}
