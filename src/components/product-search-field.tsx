"use client";

import { useCallback, useEffect, useState } from "react";

export type ProductLite = {
  id: string;
  sku: string;
  name: string;
  sellPrice: number;
  stockQty: number;
  unit: string;
};

type Props = {
  namePrefix: string;
  label: string;
  onSelect?: (p: ProductLite | null) => void;
};

export default function ProductSearchField({ namePrefix, label, onSelect }: Props) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ProductLite[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductLite | null>(null);

  const fetchItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      setItems([]);
      return;
    }
    const res = await fetch(
      `/api/products/search?q=${encodeURIComponent(query)}&limit=20`
    );
    if (!res.ok) return;
    const data = (await res.json()) as { items: ProductLite[] };
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchItems(q);
    }, 200);
    return () => clearTimeout(t);
  }, [q, fetchItems]);

  return (
    <div className="relative">
      <label className="block text-xs text-zinc-500" htmlFor={`${namePrefix}-search`}>
        {label}
      </label>
      <input
        id={`${namePrefix}-search`}
        autoComplete="off"
        value={selected ? `${selected.sku} — ${selected.name}` : q}
        onChange={(e) => {
          setSelected(null);
          onSelect?.(null);
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Ketik SKU atau nama…"
        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
      />
      <input type="hidden" name="productId" value={selected?.id ?? ""} />

      {open && !selected && items.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-zinc-700 bg-zinc-950 py-1 text-sm shadow-lg">
          {items.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800"
                onClick={() => {
                  setSelected(p);
                  setQ("");
                  setOpen(false);
                  onSelect?.(p);
                }}
              >
                <span className="font-mono text-xs text-amber-200/90">{p.sku}</span>
                <span className="mt-0.5 block text-xs text-zinc-400">{p.name}</span>
                <span className="text-[10px] text-zinc-500">
                  Stok {p.stockQty} {p.unit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
