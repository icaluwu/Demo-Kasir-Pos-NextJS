import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Mesin",
  "Kelistrikan",
  "Bodi",
  "Fastener",
  "Fluid",
  "Rem",
  "Suspensi",
  "Transmisi",
  "Aksesoris",
  "Filter",
];
const brands = ["GEN", "OEM", "ALT", "PREM"];
const parts = [
  "Seal",
  "Bushing",
  "Bearing",
  "Belt",
  "Filter",
  "Plug",
  "Sensor",
  "Hose",
  "Clamp",
  "Baut",
  "Mur",
  "Ring",
  "Kampas",
  "Kabel",
  "Relay",
  "Switch",
  "Gear",
  "Shaft",
  "Piston",
  "Coupler",
];

async function main() {
  const batchSize = 500;
  const total = 10_000;
  const existing = await prisma.product.count();
  if (existing >= total) {
    console.log(`Sudah ada ${existing} produk, seed dilewati.`);
    return;
  }

  const startIndex = existing;

  for (let i = startIndex; i < total; i += batchSize) {
    const rows = [];
    const limit = Math.min(batchSize, total - i);
    for (let j = 0; j < limit; j++) {
      const idx = i + j + 1;
      const sku = `SP-${String(idx).padStart(6, "0")}`;
      const cat = categories[idx % categories.length];
      const brand = brands[idx % brands.length];
      const p = parts[idx % parts.length];
      const name = `${p} ${cat} Seri ${(idx % 50) + 1}`;
      const cost = 5000 + (idx % 500) * 1000;
      const sell = Math.round(Number(cost) * 1.15);
      rows.push({
        sku,
        name,
        category: cat,
        brand,
        unit: "pcs",
        costPrice: cost,
        sellPrice: sell,
        stockQty: (idx % 20) * 2,
        active: true,
      });
    }
    await prisma.product.createMany({ data: rows, skipDuplicates: true });
    console.log(`Seed progress: ${Math.min(i + limit, total)}/${total}`);
  }

  console.log(`Selesai. Total produk di database: ${await prisma.product.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
