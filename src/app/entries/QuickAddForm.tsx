"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addEntry, fetchQuickFoods, type EntryRow } from "./actions";
import type { QuickFood } from "@/lib/quickFoods";

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

  // "Your usual" — foods logged often enough recently to skip retyping. Fetched once on mount;
  // this list is about general habits, not tied to whichever date is being edited, so it doesn't
  // need to refetch when the day switcher moves (see WeekLog).
  const [quickFoods, setQuickFoods] = useState<QuickFood[]>([]);
  useEffect(() => {
    fetchQuickFoods().then(setQuickFoods);
  }, []);

  const [addingLabel, setAddingLabel] = useState<string | null>(null);
  const [quickError, setQuickError] = useState("");
  const [, startQuickAdd] = useTransition();

  function quickAdd(food: QuickFood) {
    setAddingLabel(food.label);
    setQuickError("");
    startQuickAdd(async () => {
      const formData = new FormData();
      formData.set("entry_date", date);
      formData.set("label", food.label);
      formData.set("amount", String(food.amount));

      const result = await addEntry(formData);
      setAddingLabel(null);
      if ("error" in result) {
        setQuickError(result.error);
        return;
      }
      onAdded(result.entry);
    });
  }

  return (
    <div className="space-y-2">
      {quickFoods.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs text-muted">Your usual</p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {quickFoods.map((food) => (
              <button
                key={food.label}
                type="button"
                onClick={() => quickAdd(food)}
                disabled={addingLabel === food.label}
                className="flex shrink-0 items-baseline gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-ink disabled:opacity-50"
              >
                <span className="max-w-32 truncate">{food.label}</span>
                <span className="font-mono text-muted">{food.amount}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {quickError ? <p className="text-xs text-zone-over">{quickError}</p> : null}

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
