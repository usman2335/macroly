"use client";

import { useActionState } from "react";
import { saveMuscleTargets, type ProfileFormState } from "./actions";
import { capitalize, groupMuscles, type Muscle } from "@/lib/muscles";

const initialState: ProfileFormState = { error: "" };

export default function MuscleTargetsForm({
  muscles,
  targets,
}: {
  muscles: Muscle[];
  targets: Record<string, number>;
}) {
  const [state, formAction, pending] = useActionState(saveMuscleTargets, initialState);
  const groups = groupMuscles(muscles);

  return (
    <form action={formAction} className="w-full space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-ink">Weekly muscle targets</p>
        <p className="text-xs text-muted">
          How many times a week you want to hit each muscle. Defaults to 2 — change any of them.
        </p>
      </div>

      {groups.map(({ group, muscles: groupMuscleList }) => (
        <div key={group} className="space-y-1.5">
          <p className="text-sm text-muted">{capitalize(group)}</p>
          <div className="space-y-1.5">
            {groupMuscleList.map((muscle) => (
              <div key={muscle.id} className="flex items-center justify-between gap-3">
                <label htmlFor={`target_${muscle.id}`} className="text-sm text-ink">
                  {muscle.name}
                </label>
                <input
                  id={`target_${muscle.id}`}
                  name={`target_${muscle.id}`}
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={targets[muscle.id] ?? 2}
                  className="w-16 rounded-md border border-line bg-transparent px-2 py-1 text-right font-mono text-ink outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {state.error ? (
        <p className="text-sm text-zone-over" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent px-3 py-2 text-base font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save targets"}
      </button>
    </form>
  );
}
