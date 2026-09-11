"use client";

import { useActionState, useRef } from "react";
import { addEntry, type EntryRow } from "./actions";

type State = { error: string };
const initialState: State = { error: "" };

export default function QuickAddForm({
  kind,
  date,
  onAdded,
}: {
  kind: "food" | "activity";
  date: string;
  onAdded: (entry: EntryRow) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prevState: State, formData: FormData) => {
      const result = await addEntry(formData);
      if ("error" in result) return result;
      formRef.current?.reset();
      onAdded(result.entry);
      return initialState;
    },
    initialState,
  );

  return (
    <div className="space-y-1">
      <form ref={formRef} action={formAction} className="flex items-start gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="entry_date" value={date} />
        <input
          name="label"
          type="text"
          required
          placeholder={kind === "food" ? "What did you eat?" : "Workout (e.g. Push day)"}
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
        {kind === "food" ? (
          <input
            name="amount"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            placeholder="cal"
            className="w-20 rounded-lg border border-neutral-300 px-2 py-2 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        ) : null}
        <button
          type="submit"
          disabled={pending}
          aria-label="Add"
          className="rounded-lg bg-neutral-900 px-3 py-2 text-base font-medium text-white disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900"
        >
          +
        </button>
      </form>
      {state.error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
    </div>
  );
}
