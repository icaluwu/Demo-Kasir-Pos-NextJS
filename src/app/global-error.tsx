"use client";

/**
 * Menangkap error pada root layout (jika ada). Wajib menyediakan html + body.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#09090b] text-zinc-200 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-zinc-50">
            Aplikasi gagal memuat
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Periksa <strong className="text-zinc-300">SESSION_SECRET</strong> (≥32 karakter),
            <strong className="text-zinc-300"> DATABASE_URL</strong>, dan{" "}
            <strong className="text-zinc-300">DATABASE_URL_UNPOOLED</strong> di Vercel.
          </p>
          {error.digest ? (
            <p className="mt-3 font-mono text-xs text-zinc-500">Digest: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950"
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
