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

  Pastikan nilai `DATABASE_URL` dan `DIRECT_URL` di `.env.local` mengarah ke `127.0.0.1:5432`, sesuai contoh di [`.env.example`](./.env.example).

- **Layanan cloud** (misalnya [Neon](https://neon.tech), [Supabase](https://supabase.com), atau instans Postgres lain) — ganti connection string dengan URL yang valid. Hindari placeholder seperti hostname literal `HOST`; Prisma akan gagal menghubungi database.

### 2. Variabel lingkungan

Salin contoh env dan sesuaikan:

```bash
cp .env.example .env.local
```

Isi minimal:

| Variabel | Keterangan |
| -------- | ---------- |
| `DATABASE_URL` | Connection string Postgres yang dapat dijangkau dari mesin Anda. |
| `DIRECT_URL` | Untuk migrasi Prisma; di lokal Docker biasanya sama dengan `DATABASE_URL`. |
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

### Membuat database

1. Buat project dan database di Neon (atau pasang integrasi Neon dari Vercel).
2. Di dashboard Neon, buka **Connection details**. Biasanya tersedia URL **pooled** (untuk runtime serverless) dan URL **direct** (untuk migrasi schema).

### Menghubungkan repositori

Impor repositori Git ke Vercel. Framework Next.js terdeteksi otomatis. Perintah build pada [`package.json`](./package.json) sudah mencakup `prisma generate` sebelum `next build`.

### Variabel lingkungan di Vercel

Di **Settings → Environment Variables**, set untuk **Production** (dan **Preview** jika perlu):

| Name | Isi |
| ---- | --- |
| `DATABASE_URL` | URL pooled Neon untuk runtime. |
| `DIRECT_URL` | URL direct Neon untuk `prisma db push` / migrate dari mesin lokal. |
| `SESSION_SECRET` | String acak ≥ 32 karakter. |
| `ADMIN_USERNAME` | Nama pengguna admin. |
| `ADMIN_PASSWORD` | Kata sandi; ganti dari default sebelum URL dipublikasikan. |

Setelah mengubah variabel, lakukan **Redeploy**.

### Migrasi schema ke database production

Dari mesin lokal, gunakan connection string yang konsisten dengan Neon (utamakan **`DIRECT_URL`** yang benar untuk migrasi):

```bash
npx prisma db push
```

Opsional: `npm run db:seed` hanya jika memang boleh mengisi data contoh pada database production.

### Catatan operasional

- Deployment **Preview** dapat memakai branch database Neon terpisah atau database yang sama, menurut kebijakan tim.
- Kombinasi Prisma, serverless, dan banyak koneksi pendek berjalan lebih stabil dengan URL **pooled**.
- Jangan meng-commit berkas `.env` yang berisi rahasia; gunakan **Environment Variables** di Vercel.

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
