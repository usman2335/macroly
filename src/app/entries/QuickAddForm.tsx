"use client";

import { useActionState, useRef } from "react";
import { addEntry, type EntryRow } from "./actions";

type State = { error: string };
const initialState: State = { error: "" };

export default function QuickAddForm({
  date,
  onAdded,
}: {
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
        <input type="hidden" name="entry_date" value={date} />
        <input
          name="label"
          type="text"
          required
          placeholder="What did you eat?"
          className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-3 py-2 text-base text-ink outline-none focus:border-accent"
        />
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          required
          placeholder="cal"
          className="w-20 rounded-md border border-line bg-transparent px-2 py-2 text-base text-ink outline-none focus:border-accent font-mono"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Add"
          className="rounded-md bg-accent px-3 py-2 text-base font-medium text-paper disabled:opacity-60"
        >
          +
        </button>
      </form>
      {state.error ? <p className="text-xs text-zone-over">{state.error}</p> : null}
    </div>
  );
}
