"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, formatDateForDisplay } from "@/lib/date";
import { capitalize, groupMuscles, type Muscle } from "@/lib/muscles";
import { withViewTransition } from "@/lib/viewTransition";
import { fetchWorkoutMuscles, saveWorkout } from "./actions";

function sameMembers(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

export default function TrainingLog({
  muscles,
  initialDate,
  initialMuscleIds,
}: {
  muscles: Muscle[];
  initialDate: string;
  initialMuscleIds: string[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  // savedByDate mirrors what's actually persisted; draftByDate is what's on screen right now.
  // They diverge the moment you tap a muscle, and only reconverge on Save (or Discard).
  const [savedByDate, setSavedByDate] = useState<Record<string, Set<string>>>({
    [initialDate]: new Set(initialMuscleIds),
  });
  const [draftByDate, setDraftByDate] = useState<Record<string, Set<string>>>({
    [initialDate]: new Set(initialMuscleIds),
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saved = savedByDate[selectedDate] ?? new Set<string>();
  const draft = draftByDate[selectedDate] ?? new Set<string>();
  const isDirty = !sameMembers(draft, saved);
  const groups = groupMuscles(muscles);

  async function changeDate(newDate: string) {
    if (isDirty) return; // save or discard first — see the guard on the nav buttons below
    withViewTransition(() => {
      setSelectedDate(newDate);
      setError("");
    });
    if (savedByDate[newDate]) return;

    setLoading(true);
    const muscleIds = await fetchWorkoutMuscles(newDate);
    const set = new Set(muscleIds);
    setSavedByDate((prev) => ({ ...prev, [newDate]: set }));
    setDraftByDate((prev) => ({ ...prev, [newDate]: new Set(set) }));
    setLoading(false);
  }

  function toggleMuscle(muscleId: string) {
    const next = new Set(draft);
    if (next.has(muscleId)) next.delete(muscleId);
    else next.add(muscleId);
    setDraftByDate((prev) => ({ ...prev, [selectedDate]: next }));
  }

  function discard() {
    setDraftByDate((prev) => ({ ...prev, [selectedDate]: new Set(saved) }));
    setError("");
  }

  async function save() {
    setSaving(true);
    const result = await saveWorkout(selectedDate, Array.from(draft));
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setError("");
    setSavedByDate((prev) => ({ ...prev, [selectedDate]: new Set(draft) }));
    // The dashboard's training card and this tab's TrainingDetails both live outside this
    // component (Module 6) and get their numbers from page.tsx's server render.
    router.refresh();
  }

  return (
    <div className="flex w-full flex-col gap-5">
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
        <span className="text-sm text-ink">
          {formatDateForDisplay(selectedDate)}
          {loading ? "…" : ""}
        </span>
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

      <div className="space-y-4">
        {groups.map(({ group, muscles: groupMuscleList }) => (
          <div key={group} className="space-y-1.5">
            <p className="text-sm text-muted">{capitalize(group)}</p>
            <div className="flex flex-wrap gap-2">
              {groupMuscleList.map((muscle) => {
                const isTrained = draft.has(muscle.id);
                return (
                  <button
                    key={muscle.id}
                    type="button"
                    onClick={() => toggleMuscle(muscle.id)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      isTrained ? "border-accent bg-accent text-paper" : "border-line text-ink"
                    }`}
                  >
                    {muscle.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-zone-over">{error}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {isDirty ? "Unsaved changes" : draft.size > 0 ? "Saved" : "Nothing logged yet."}
        </p>
        {isDirty ? (
          <div className="flex gap-4">
            <button type="button" onClick={discard} className="text-sm text-muted">
              Discard
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="text-sm font-medium text-accent disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
