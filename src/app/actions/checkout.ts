"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { nextInvoiceNo } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

export type CheckoutLine = { productId: string; qty: number };

export async function checkoutAction(lines: CheckoutLine[]) {
  await requireAuth();

  if (!lines?.length) {
    return { ok: false as const, error: "Keranjang kosong." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const invoiceNo = nextInvoiceNo();
      const saleLines: {
        productId: string;
        qty: number;
        unitPrice: number;
        subtotal: number;
      }[] = [];

      for (const line of lines) {
        const q = Math.floor(line.qty);
        if (q <= 0) throw new Error("Jumlah tidak valid.");

        const p = await tx.product.findFirst({
          where: { id: line.productId, active: true },
        });
        if (!p) throw new Error("Salah satu produk tidak ditemukan.");
        if (p.stockQty < q) {
          throw new Error(`Stok ${p.sku} tidak cukup (tersisa ${p.stockQty}).`);
        }

        const unitPrice = Number(p.sellPrice);
        const subtotal = unitPrice * q;
        saleLines.push({ productId: p.id, qty: q, unitPrice, subtotal });
      }

      const total = saleLines.reduce((s, l) => s + l.subtotal, 0);

      const sale = await tx.sale.create({
        data: {
          invoiceNo,
          total,
          lines: {
            create: saleLines.map((l) => ({
              productId: l.productId,
              qty: l.qty,
              unitPrice: l.unitPrice,
              subtotal: l.subtotal,
            })),
          },
        },
      });

      for (const l of saleLines) {
        await tx.product.update({
          where: { id: l.productId },
          data: { stockQty: { decrement: l.qty } },
        });
        await tx.stockMovement.create({
          data: {
            productId: l.productId,
            type: "OUT_SALE",
            qty: l.qty,
            note: `Penjualan ${invoiceNo}`,
            refSaleId: sale.id,
          },
        });
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout gagal.";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/");
  revalidatePath("/penjualan");
  revalidatePath("/stok");
  revalidatePath("/master");
  return { ok: true as const };
}
