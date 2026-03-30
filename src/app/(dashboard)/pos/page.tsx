import PosClient from "./pos-client";

export default function PosPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Kasir (POS)</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Penjualan harian — stok otomatis berkurang per baris.
        </p>
      </div>
      <PosClient />
    </div>
  );
}
