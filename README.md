# Ical's Demo POS

Aplikasi web **point of sale (POS)** dan **inventori** untuk kebutuhan demo klien. Dibangun dengan [Next.js 16](https://nextjs.org) (App Router), [Prisma](https://www.prisma.io), dan [PostgreSQL](https://www.postgresql.org), siap di-deploy ke [Vercel](https://vercel.com).

## Penulis

**Teuku Vaickal Rizki Irdian**

## Ringkasan fitur

- **Master barang** — pencarian dan pagination (dirancang hingga skala sekitar 10.000 SKU).
- **Impor CSV** dan skrip seed untuk 10.000 contoh sparepart.
- **Stok masuk dan keluar** dengan riwayat mutasi.
- **Kasir (POS)** — penjualan harian mengurangi stok secara otomatis.
- **Dashboard** dan **riwayat penjualan**.
- **Panduan singkat** di rute [`/panduan`](./src/app/panduan/page.tsx) (dapat diakses tanpa login).

## Prasyarat

- [Node.js](https://nodejs.org/) 20 atau lebih baru.
- [PostgreSQL](https://www.postgresql.org/). Untuk pengembangan di Windows, cara termudah memakai [Docker Desktop](https://www.docker.com/products/docker-desktop/) bersama berkas [`docker-compose.yml`](./docker-compose.yml) pada repositori ini.

## Setup lokal

### 1. Database

Pilih salah satu:

- **Docker (disarankan)** — jalankan:

  ```bash
  docker compose up -d
  ```

  Pastikan `DATABASE_URL` dan `DATABASE_URL_UNPOOLED` di `.env.local` mengarah ke `127.0.0.1:5432` (nilai unpooled boleh sama dengan pooled), sesuai [`.env.example`](./.env.example).

- **Layanan cloud** (misalnya [Neon](https://neon.tech), [Supabase](https://supabase.com), atau instans Postgres lain) — ganti connection string dengan URL yang valid. Hindari placeholder seperti hostname literal `HOST`; Prisma akan gagal menghubungi database.

### 2. Variabel lingkungan

Salin contoh env dan sesuaikan:

```bash
cp .env.example .env.local
```

Isi minimal:

| Variabel | Keterangan |
| -------- | ---------- |
| `DATABASE_URL` | Connection string Postgres (runtime / pooled jika pakai Neon). |
| `DATABASE_URL_UNPOOLED` | URL non-pooled untuk migrasi Prisma; lokal Docker duplikat `DATABASE_URL`. |
| `SESSION_SECRET` | Minimal 32 karakter, acak; wajib di production. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Kredensial admin demo. |

### 3. Dependensi dan skema

```bash
npm install
npx prisma db push
```

### 4. Data awal (opsional)

- Seed contoh (hingga 10.000 baris):

  ```bash
  npm run db:seed
  ```

- Atau impor CSV lewat menu **Master barang**; template tersedia di [`public/produk-import-template.csv`](./public/produk-import-template.csv).

### 5. Server pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), login, lalu gunakan sidebar desktop atau chip navigasi mobile.

> Dalam mode development, jika `SESSION_SECRET` kosong, aplikasi dapat memakai fallback (lihat [`src/lib/session.ts`](./src/lib/session.ts)). Di **production**, set `SESSION_SECRET` secara eksplisit.

## Deploy ke Vercel

Vercel menjalankan aplikasi Next.js; **PostgreSQL tidak disertakan**. Gunakan database terpisah, umumnya [Neon](https://neon.tech) melalui [Vercel Marketplace](https://vercel.com/marketplace) atau akun Neon langsung.

**Integrasi Neon + Vercel** biasanya mengisi otomatis `DATABASE_URL` (pooled) dan `DATABASE_URL_UNPOOLED` (direct). Repositori ini memetakan `directUrl` Prisma ke `DATABASE_URL_UNPOOLED` agar cocok dengan nama variabel tersebut. Jika di project Anda hanya muncul `POSTGRES_URL_NON_POOLING`, tambahkan manual env **`DATABASE_URL_UNPOOLED`** dengan nilai yang sama.

### Membuat database

1. Buat project dan database di Neon (atau pasang integrasi Neon dari Vercel).
2. Pastikan ada pasangan URL **pooled** dan **unpooled** (di UI integrasi: `DATABASE_URL` + `DATABASE_URL_UNPOOLED`).

### Menghubungkan repositori

Impor repositori Git ke Vercel. Framework Next.js terdeteksi otomatis. Perintah build pada [`package.json`](./package.json) sudah mencakup `prisma generate` sebelum `next build`.

### Variabel lingkungan di Vercel

Di **Settings → Environment Variables**, set untuk **Production** (dan **Preview** jika perlu):

| Name | Isi |
| ---- | --- |
| `DATABASE_URL` | URL pooled (diisi Neon / Vercel). |
| `DATABASE_URL_UNPOOLED` | URL non-pooled (diisi Neon / Vercel); dipakai Prisma untuk migrate. |
| `SESSION_SECRET` | String acak ≥ 32 karakter (**wajib ditambahkan manual** — tidak dibuat Neon). |
| `ADMIN_USERNAME` | Nama pengguna admin. |
| `ADMIN_PASSWORD` | Kata sandi; ganti dari default sebelum URL dipublikasikan. |

Setelah mengubah variabel, lakukan **Redeploy**.

### Migrasi schema ke database production

Dari mesin lokal, salin `DATABASE_URL` dan `DATABASE_URL_UNPOOLED` dari Vercel ke `.env.production.local` (atau export sementara), lalu jalankan:

```bash
npx prisma db push
```

Opsional: `npm run db:seed` hanya jika memang boleh mengisi data contoh pada database production.

### Catatan operasional

- Deployment **Preview** dapat memakai branch database Neon terpisah atau database yang sama, menurut kebijakan tim.
- Kombinasi Prisma, serverless, dan banyak koneksi pendek berjalan lebih stabil dengan URL **pooled**.
- Jangan meng-commit berkas `.env` yang berisi rahasia; gunakan **Environment Variables** di Vercel.

### Troubleshooting: “This page couldn’t load” / error digest di browser

Production menyembunyikan pesan asli dari Server Components. Pada deploy Vercel, penyebab paling sering:

1. **`SESSION_SECRET` belum di-set atau kurang dari 32 karakter** — setiap halaman yang memakai sesi (termasuk `/login`) akan gagal. Di Vercel → Project → Settings → Environment Variables, tambahkan string acak panjang (misalnya 64 karakter), lalu **Redeploy**.
2. **`DATABASE_URL_UNPOOLED` belum di-set** — Prisma membutuhkannya (nama yang dipakai integrasi Neon di Vercel). Jika tidak ada, salin nilai dari `POSTGRES_URL_NON_POOLING` ke variabel baru `DATABASE_URL_UNPOOLED`.
3. **`DATABASE_URL` salah atau DB tidak bisa dijangkau** — pastikan host/user/password benar, firewall Neon mengizinkan Vercel (biasanya default mengizinkan), dan Anda sudah menjalankan `npx prisma db push` ke database production dari lokal.

Untuk diagnosis cepat, buka **Vercel → Deployment → Logs (Runtime)** atau tab **Functions** saat membuka URL; bandingkan dengan checklist di atas. Setelah memperbaiki env, wajib **Redeploy** deployment terbaru.

## Skrip npm

| Skrip | Fungsi |
| ----- | ------ |
| `npm run dev` | Server pengembangan (Turbopack). |
| `npm run build` | Build production (`prisma generate` lalu `next build`). |
| `npm run start` | Menjalankan build production. |
| `npm run lint` | [ESLint](https://eslint.org/). |
| `npm run db:push` | `prisma db push`. |
| `npm run db:seed` | Menjalankan [`prisma/seed.ts`](./prisma/seed.ts). |
| `npm run db:studio` | [Prisma Studio](https://www.prisma.io/studio). |

## Rute aplikasi

| Path | Fungsi |
| ---- | ------ |
| `/login` | Login admin |
| `/` | Dashboard |
| `/master` | Master barang dan impor CSV |
| `/stok` | Stok masuk dan keluar |
| `/pos` | Kasir |
| `/penjualan` | Riwayat transaksi |
| `/panduan` | Panduan training |

## Akun demo (lokal)

Nilai default mengikuti [`.env.example`](./.env.example); ubah sebelum production:

- Username: `IcalUwU`
- Password: `DemoPos123#`

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE). Hak cipta © 2026 Teuku Vaickal Rizki Irdian.
