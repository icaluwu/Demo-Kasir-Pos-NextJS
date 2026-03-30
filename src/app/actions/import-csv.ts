"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const rowSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  costPrice: z.coerce.number().finite().nonnegative(),
  sellPrice: z.coerce.number().finite().nonnegative(),
  initialStock: z.coerce.number().int().nonnegative(),
});

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if (!q && c === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export async function importProductsCsvAction(formData: FormData) {
  await requireAuth();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Pilih file CSV terlebih dahulu." };
  }

  let text = await file.text();
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { ok: false as const, error: "File kosong atau hanya header." };
  }

  const header = parseCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iSku = idx("sku");
  const iName = idx("name");
  const iCat = idx("category");
  const iBrand = idx("brand");
  const iUnit = idx("unit");
  const iCost = idx("costprice");
  const iSell = idx("sellprice");
  const iStock = idx("initialstock");

  if (iSku < 0 || iName < 0 || iCost < 0 || iSell < 0 || iStock < 0) {
    return {
      ok: false as const,
      error:
        "Header wajib: sku, name, costPrice, sellPrice, initialStock (opsional: category, brand, unit).",
    };
  }

  const parsed: z.infer<typeof rowSchema>[] = [];
  const errors: string[] = [];

  for (let r = 1; r < lines.length; r++) {
    const cells = parseCsvLine(lines[r]!);
    const get = (i: number) => (i >= 0 ? (cells[i] ?? "").trim() : "");

    const raw = {
      sku: get(iSku),
      name: get(iName),
      category: get(iCat) || null,
      brand: get(iBrand) || null,
      unit: get(iUnit) || "pcs",
      costPrice: get(iCost),
      sellPrice: get(iSell),
      initialStock: get(iStock),
    };

    const res = rowSchema.safeParse(raw);
    if (!res.success) {
      errors.push(`Baris ${r + 1}: ${res.error.flatten().formErrors.join(", ")}`);
      if (errors.length >= 20) break;
      continue;
    }
    parsed.push(res.data);
  }

  if (errors.length) {
    return {
      ok: false as const,
      error: errors.join("\n"),
    };
  }

  if (!parsed.length) {
    return { ok: false as const, error: "Tidak ada baris data valid." };
  }

  const batch = 500;
  let inserted = 0;
  let stockAdjustments = 0;

  for (let i = 0; i < parsed.length; i += batch) {
    const chunk = parsed.slice(i, i + batch);
    await prisma.$transaction(async (tx) => {
      for (const row of chunk) {
        const existing = await tx.product.findUnique({ where: { sku: row.sku } });
        if (existing) {
          const oldQty = existing.stockQty;
          await tx.product.update({
            where: { sku: row.sku },
            data: {
              name: row.name,
              category: row.category ?? undefined,
              brand: row.brand ?? undefined,
              unit: row.unit || "pcs",
              costPrice: row.costPrice,
              sellPrice: row.sellPrice,
              stockQty: row.initialStock,
            },
          });
          const delta = row.initialStock - oldQty;
          if (delta !== 0) {
            await tx.stockMovement.create({
              data: {
                productId: existing.id,
                type: "ADJUST_IMPORT",
                qty: Math.abs(delta),
                note: `Impor CSV: stok ${oldQty} → ${row.initialStock}`,
              },
            });
            stockAdjustments++;
          }
        } else {
          const p = await tx.product.create({
            data: {
              sku: row.sku,
              name: row.name,
              category: row.category ?? undefined,
              brand: row.brand ?? undefined,
              unit: row.unit || "pcs",
              costPrice: row.costPrice,
              sellPrice: row.sellPrice,
              stockQty: row.initialStock,
            },
          });
          if (row.initialStock > 0) {
            await tx.stockMovement.create({
              data: {
                productId: p.id,
                type: "IN",
                qty: row.initialStock,
                note: "Stok awal dari impor CSV",
              },
            });
          }
          inserted++;
        }
      }
    });
  }

  revalidatePath("/master");
  revalidatePath("/stok");
  revalidatePath("/");

  return {
    ok: true as const,
    message: `Impor selesai. SKU baru: ${inserted}, baris diproses: ${parsed.length}, penyesuaian stok dari baris yang sudah ada: ${stockAdjustments}.`,
  };
}
