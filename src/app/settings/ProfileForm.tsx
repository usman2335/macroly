"use client";

import { useActionState, useRef } from "react";
import { saveProfile, type ProfileFormState } from "./actions";
import {
  ageFromBirthDate,
  calculateBMR,
  calculateActiveMaintenance,
  calculateSedentaryMaintenance,
  calculateWeeklyBudget,
  type Sex,
} from "@/lib/calorie";

export type ProfileFormValues = {
  display_name: string;
  sex: Sex | "";
  birth_date: string;
  height_cm: string;
  weight_kg: string;
  gym_days_per_week: string;
  sedentary_maintenance: string;
  active_maintenance: string;
  week_starts_on: "monday" | "sunday";
};

const initialState: ProfileFormState = { error: "" };

const inputClass =
  "w-full rounded-md border border-line bg-transparent px-3 py-2 text-base text-ink outline-none focus:border-accent";
const numberInputClass = `${inputClass} font-mono`;
const labelClass = "text-sm text-muted";

export default function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  const sedentaryRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLInputElement>(null);
  const sexRef = useRef<HTMLSelectElement>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const gymDaysRef = useRef<HTMLInputElement>(null);

  function recalculate() {
    const sex = sexRef.current?.value as Sex | undefined;
    const birthDate = birthDateRef.current?.value;
    const heightCm = Number(heightRef.current?.value);
    const weightKg = Number(weightRef.current?.value);
    const gymDaysPerWeek = Number(gymDaysRef.current?.value);

    if (!sex || !birthDate || !heightCm || !weightKg) return;

    const bmr = calculateBMR({ sex, age: ageFromBirthDate(birthDate), heightCm, weightKg });
    const sedentary = calculateSedentaryMaintenance(bmr);
    const active = calculateActiveMaintenance(bmr, gymDaysPerWeek || 0);

    if (sedentaryRef.current) sedentaryRef.current.value = String(sedentary);
    if (activeRef.current) activeRef.current.value = String(active);
  }

  const weeklyBudget = Number(initial.sedentary_maintenance)
    ? calculateWeeklyBudget(Number(initial.sedentary_maintenance))
    : null;

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="display_name" className={labelClass}>
          Name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          defaultValue={initial.display_name}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sex" className={labelClass}>
          Sex
        </label>
        <select
          id="sex"
          name="sex"
          required
          ref={sexRef}
          defaultValue={initial.sex}
          className={inputClass}
        >
          <option value="" disabled>
            Select...
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="birth_date" className={labelClass}>
          Date of birth
        </label>
        <input
          id="birth_date"
          name="birth_date"
          type="date"
          required
          ref={birthDateRef}
          defaultValue={initial.birth_date}
          className={numberInputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="height_cm" className={labelClass}>
            Height (cm)
          </label>
          <input
            id="height_cm"
            name="height_cm"
            type="number"
            step="0.1"
            required
            ref={heightRef}
            defaultValue={initial.height_cm}
            className={numberInputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="weight_kg" className={labelClass}>
            Weight (kg)
          </label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            required
            ref={weightRef}
            defaultValue={initial.weight_kg}
            className={numberInputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="gym_days_per_week" className={labelClass}>
          Gym days per week
        </label>
        <input
          id="gym_days_per_week"
          name="gym_days_per_week"
          type="number"
          min={0}
          max={7}
          step={1}
          required
          ref={gymDaysRef}
          defaultValue={initial.gym_days_per_week}
          className={numberInputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="week_starts_on" className={labelClass}>
          Week starts on
        </label>
        <select
          id="week_starts_on"
          name="week_starts_on"
          defaultValue={initial.week_starts_on}
          className={inputClass}
        >
          <option value="monday">Monday</option>
          <option value="sunday">Sunday</option>
        </select>
      </div>

      <div className="space-y-3 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Maintenance calories</p>
          <button
            type="button"
            onClick={recalculate}
            className="text-sm text-accent underline underline-offset-2"
          >
            Recalculate from stats
          </button>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sedentary_maintenance" className={labelClass}>
            Sedentary maintenance (your target)
          </label>
          <input
            id="sedentary_maintenance"
            name="sedentary_maintenance"
            type="number"
            step={1}
            required
            ref={sedentaryRef}
            defaultValue={initial.sedentary_maintenance}
            className={numberInputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="active_maintenance" className={labelClass}>
            Activity-adjusted maintenance
          </label>
          <input
            id="active_maintenance"
            name="active_maintenance"
            type="number"
            step={1}
            required
            ref={activeRef}
            defaultValue={initial.active_maintenance}
            className={numberInputClass}
          />
        </div>

        <p className="text-xs text-muted">
          Both numbers are editable — if you disagree with the math, type your own. Weekly budget
          {weeklyBudget !== null
            ? ` is currently ${weeklyBudget} cal (sedentary × 7).`
            : " will show once saved."}
        </p>
      </div>

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
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
