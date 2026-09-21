"use client";

import { useState, type CSSProperties } from "react";
import { useActionState } from "react";
import { saveMuscleTargets, type ProfileFormState } from "./actions";
import { withViewTransition } from "@/lib/viewTransition";
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
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group);

  return (
    <form action={formAction} className="w-full space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-ink">Weekly muscle targets</p>
        <p className="text-xs text-muted">
          How many times a week you want to hit each muscle. Defaults to 2 — change any of them.
        </p>
      </div>

      {/* All groups stay mounted (just visually hidden) so switching tabs never drops an edit
          you made in another group — one Save still submits every muscle's value at once. */}
      <div className="flex flex-wrap gap-1 border-b border-line">
        {groups.map(({ group }) => (
          <button
            key={group}
            type="button"
            onClick={() => withViewTransition(() => setActiveGroup(group))}
            style={
              activeGroup === group
                ? ({ viewTransitionName: "muscle-group-indicator" } as CSSProperties)
                : undefined
            }
            className={`-mb-px border-b-2 px-2 py-2 text-sm ${
              activeGroup === group ? "border-accent text-ink" : "border-transparent text-muted"
            }`}
          >
            {capitalize(group)}
          </button>
        ))}
      </div>

      {groups.map(({ group, muscles: groupMuscleList }) => (
        <div key={group} className={activeGroup === group ? "space-y-1.5" : "hidden"}>
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
