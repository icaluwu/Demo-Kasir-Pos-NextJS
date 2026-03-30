"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function stockInAction(formData: FormData) {
  await requireAuth();
  const productId = String(formData.get("productId") ?? "");
  const qty = Number(formData.get("qty"));
  const note = String(formData.get("note") ?? "").trim();

  if (!productId || !Number.isFinite(qty) || qty <= 0) {
    return { ok: false as const, error: "Produk dan jumlah wajib diisi (qty > 0)." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const p = await tx.product.findFirst({
        where: { id: productId, active: true },
      });
      if (!p) throw new Error("Produk tidak ditemukan.");

      await tx.product.update({
        where: { id: productId },
        data: { stockQty: { increment: Math.floor(qty) } },
      });
      await tx.stockMovement.create({
        data: {
          productId,
          type: "IN",
          qty: Math.floor(qty),
          note: note || "Stok masuk",
        },
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan.";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/stok");
  revalidatePath("/master");
  revalidatePath("/");
  return { ok: true as const };
}

export async function stockOutAction(formData: FormData) {
  await requireAuth();
  const productId = String(formData.get("productId") ?? "");
  const qty = Number(formData.get("qty"));
  const note = String(formData.get("note") ?? "").trim();

  if (!productId || !Number.isFinite(qty) || qty <= 0) {
    return { ok: false as const, error: "Produk dan jumlah wajib diisi (qty > 0)." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const p = await tx.product.findFirst({
        where: { id: productId, active: true },
      });
      if (!p) throw new Error("Produk tidak ditemukan.");
      if (p.stockQty < Math.floor(qty)) throw new Error("Stok tidak cukup.");

      await tx.product.update({
        where: { id: productId },
        data: { stockQty: { decrement: Math.floor(qty) } },
      });
      await tx.stockMovement.create({
        data: {
          productId,
          type: "OUT_ADJ",
          qty: Math.floor(qty),
          note: note || "Stok keluar (adjustment)",
        },
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan.";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/stok");
  revalidatePath("/master");
  revalidatePath("/");
  return { ok: true as const };
}
