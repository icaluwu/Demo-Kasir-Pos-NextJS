"use client";

import { useEffect } from "react";

/**
 * Menangkap error render di branch App Router (di bawah root layout).
 * Di production, `error.message` sering dikosongkan; tampilkan checklist env Vercel.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[var(--bg)] px-6 py-16 text-center text-zinc-200">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
        Ical&apos;s Demo POS
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-50">
        Terjadi kesalahan server
      </h1>
      <p className="mt-2 max-w-lg text-sm text-zinc-400">
        Di <strong className="text-zinc-300">Vercel</strong>, halaman ini biasanya muncul jika
        variabel lingkungan belum lengkap atau database belum siap. Production menyembunyikan
        detail error; periksa checklist di bawah lalu redeploy.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-zinc-500">
          Digest: {error.digest}
        </p>
      ) : null}
      <ol className="mt-8 max-w-md list-decimal space-y-2 text-left text-sm text-zinc-400">
        <li>
          <code className="text-amber-200/90">SESSION_SECRET</code> — wajib ada, minimal
          32 karakter (acak).
        </li>
        <li>
          <code className="text-amber-200/90">DATABASE_URL</code> — Postgres (Neon{" "}
          <em>pooled</em>), host valid (bukan <code>HOST</code> placeholder).
        </li>
        <li>
          <code className="text-amber-200/90">DATABASE_URL_UNPOOLED</code> — non-pooled
          (integrasi Neon di Vercel mengisinya otomatis; lihat{" "}
          <code className="text-amber-200/90">.env.example</code>).
        </li>
        <li>
          Dari lokal, setelah DB production kosong:{" "}
          <code className="whitespace-normal text-amber-200/90">npx prisma db push</code>
        </li>
      </ol>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-amber-500/50 hover:text-amber-200"
      >
        Coba lagi
      </button>
    </div>
  );
}
