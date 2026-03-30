import Link from "next/link";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PanduanPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-10 text-zinc-200">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
          Ical&apos;s Demo POS
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
          Panduan singkat (training)
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Versi demo untuk presentasi ke klien. Deploy direkomendasikan ke Vercel dengan
          database Postgres (misalnya Neon).
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {session.isLoggedIn ? (
            <Link
              href="/"
              className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400"
            >
              Kembali ke dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400"
            >
              Login admin
            </Link>
          )}
        </div>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">1. Login</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>Buka halaman Login, masukkan username &amp; password admin.</li>
            <li>Kredensial default mengikuti variabel environment (lihat README).</li>
            <li>Untuk production, wajib ganti password dan set SESSION_SECRET kuat.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">2. Master barang (~10.000 SKU)</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>
              Menu <strong className="text-zinc-300">Master barang</strong>: cari by SKU
              atau nama dengan pagination.
            </li>
            <li>
              <strong className="text-zinc-300">Setup awal</strong>: gunakan{" "}
              <code className="text-amber-200/90">npm run db:seed</code> untuk generate
              10.000 contoh sparepart, atau impor CSV.
            </li>
            <li>
              Unduh template <code className="text-amber-200/90">/produk-import-template.csv</code>{" "}
              dari halaman master. Kolom: sku, name, category, brand, unit, costPrice,
              sellPrice, initialStock.
            </li>
            <li>
              SKU yang sudah ada akan di-update; stok diset ke{" "}
              <code className="text-amber-200/90">initialStock</code> dengan catatan mutasi
              penyesuaian.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">3. Stok masuk &amp; keluar</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>
              <strong className="text-zinc-300">Stok masuk</strong>: penerimaan PO,
              retur masuk, koreksi tambah.
            </li>
            <li>
              <strong className="text-zinc-300">Stok keluar</strong>: pengeluaran non-penjualan
              (rusak, sampling, internal).
            </li>
            <li>
              Penjualan lewat <strong className="text-zinc-300">Kasir (POS)</strong> otomatis
              mengurangi stok — tidak perlu input ganda di menu stok.
            </li>
            <li>Riwayat 40 mutasi terakhir ditampilkan di bawah form.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">4. Kasir (POS)</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>Cari barang, klik hasil untuk masuk keranjang.</li>
            <li>Baris sama akan menggabung qty.</li>
            <li>
              Tombol <strong className="text-zinc-300">Bayar &amp; simpan</strong> membentuk
              invoice, mengurangi stok, dan mencatat penjualan.
            </li>
            <li>Jika stok tidak cukup, sistem menolak transaksi dan menampilkan pesan.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">5. Penjualan &amp; dashboard</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>
              <strong className="text-zinc-300">Penjualan</strong>: daftar transaksi dengan
              detail per baris.
            </li>
            <li>
              <strong className="text-zinc-300">Dashboard</strong>: ringkasan SKU aktif,
              stok rendah, omzet hari ini, dan 7 hari terakhir.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">6. Deploy Vercel (ringkas)</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-400">
            <li>Push repo ke GitHub / GitLab.</li>
            <li>
              Buat project di Vercel. Neon mengisi{" "}
              <code className="text-amber-200/90">DATABASE_URL</code> dan{" "}
              <code className="text-amber-200/90">DATABASE_URL_UNPOOLED</code>. Tambahkan
              manual:{" "}
              <code className="text-amber-200/90">SESSION_SECRET</code>,{" "}
              <code className="text-amber-200/90">ADMIN_USERNAME</code>,{" "}
              <code className="text-amber-200/90">ADMIN_PASSWORD</code>.
            </li>
            <li>
              Pada Postgres kosong, jalankan migrasi dari lokal terhadap DB production:{" "}
              <code className="text-amber-200/90">npx prisma db push</code> atau{" "}
              <code className="text-amber-200/90">migrate deploy</code> sesuai workflow tim.
            </li>
            <li>
              Opsional: <code className="text-amber-200/90">npm run db:seed</code> pada
              lingkungan yang aman.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
