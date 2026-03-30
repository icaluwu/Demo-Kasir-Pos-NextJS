"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { importProductsCsvAction } from "@/app/actions/import-csv";

type State =
  | null
  | { ok: true; message: string }
  | { ok: false; error: string };

export default function ImportCsvForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prev: State, formData: FormData) => {
      const res = await importProductsCsvAction(formData);
      if (res.ok) queueMicrotask(() => router.refresh());
      return res;
    },
    null as State
  );

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-zinc-500" htmlFor="csv">
          File .csv
        </label>
        <input
          id="csv"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="mt-1 block w-full max-w-xs text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-950 hover:file:bg-amber-400"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
      >
        {pending ? "Mengimpor…" : "Impor"}
      </button>
      {state && !state.ok && (
        <p className="w-full whitespace-pre-wrap text-xs text-red-300">{state.error}</p>
      )}
      {state && state.ok && (
        <p className="w-full whitespace-pre-wrap text-xs text-emerald-300">{state.message}</p>
      )}
    </form>
  );
}
