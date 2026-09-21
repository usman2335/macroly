"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, formatDateForDisplay } from "@/lib/date";
import { withViewTransition } from "@/lib/viewTransition";
import { deleteWeightEntry, logWeight, type WeightEntry } from "./actions";
import WeightTrendChart from "./WeightTrendChart";

export default function WeightPanel({
  initialHistory,
  initialDate,
}: {
  initialHistory: WeightEntry[];
  initialDate: string;
}) {
  const router = useRouter();
  const [history, setHistory] = useState(initialHistory); // ascending by entry_date
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const savedEntry = history.find((e) => e.entry_date === selectedDate) ?? null;
  const [draft, setDraft] = useState(savedEntry ? String(savedEntry.weight_kg) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isDirty = draft !== (savedEntry ? String(savedEntry.weight_kg) : "");

  function changeDate(newDate: string) {
    if (isDirty) return; // save or discard first — see the guard on the nav buttons below
    withViewTransition(() => {
      setSelectedDate(newDate);
      const entry = history.find((e) => e.entry_date === newDate) ?? null;
      setDraft(entry ? String(entry.weight_kg) : "");
      setError("");
    });
  }

  function discard() {
    setDraft(savedEntry ? String(savedEntry.weight_kg) : "");
    setError("");
  }

  async function save() {
    setSaving(true);
    const formData = new FormData();
    formData.set("entry_date", selectedDate);
    formData.set("weight_kg", draft);

    const result = await logWeight(formData);
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setError("");
    setHistory((prev) =>
      [...prev.filter((e) => e.entry_date !== selectedDate), result.entry].sort((a, b) =>
        a.entry_date.localeCompare(b.entry_date),
      ),
    );
    // The dashboard's weight card lives outside this component and gets its numbers from
    // page.tsx's server render (same reasoning as WeekLog/TrainingLog).
    router.refresh();
  }

  async function remove() {
    if (!savedEntry) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("id", savedEntry.id);
    await deleteWeightEntry(formData);
    setSaving(false);
    setHistory((prev) => prev.filter((e) => e.id !== savedEntry.id));
    setDraft("");
    setError("");
    router.refresh();
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <WeightTrendChart history={history} />

      <div className="space-y-3 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeDate(addDays(selectedDate, -1))}
            disabled={isDirty}
            className="flex h-11 w-11 items-center justify-center text-muted disabled:opacity-40"
            aria-label="Previous day"
          >
            ‹
          </button>
          <span className="text-sm text-ink">{formatDateForDisplay(selectedDate)}</span>
          <button
            type="button"
            onClick={() => changeDate(addDays(selectedDate, 1))}
            disabled={isDirty}
            className="flex h-11 w-11 items-center justify-center text-muted disabled:opacity-40"
            aria-label="Next day"
          >
            ›
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            placeholder="kg"
            className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-3 py-2 text-base text-ink outline-none focus:border-accent font-mono"
          />
        </div>

        {error ? <p className="text-xs text-zone-over">{error}</p> : null}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {isDirty ? "Unsaved changes" : savedEntry ? "Saved" : "Nothing logged this day."}
          </p>
          <div className="flex gap-4">
            {!isDirty && savedEntry ? (
              <button
                type="button"
                onClick={remove}
                disabled={saving}
                className="text-sm text-zone-over disabled:opacity-60"
              >
                Delete
              </button>
            ) : null}
            {isDirty ? (
              <button type="button" onClick={discard} className="text-sm text-muted">
                Discard
              </button>
            ) : null}
            {isDirty ? (
              <button
                type="button"
                onClick={save}
                disabled={saving || draft === ""}
                className="text-sm font-medium text-accent disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
