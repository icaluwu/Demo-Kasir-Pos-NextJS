import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? "30") || 30, 50);

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { sku: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { sku: "asc" },
    select: {
      id: true,
      sku: true,
      name: true,
      sellPrice: true,
      stockQty: true,
      unit: true,
    },
  });

  return NextResponse.json({
    items: items.map((p) => ({
      ...p,
      sellPrice: Number(p.sellPrice),
    })),
  });
}
