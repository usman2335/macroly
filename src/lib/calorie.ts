/**
 * Calorie/maintenance math — see docs/domain-rules.md for the rules these implement.
 *
 * Mifflin-St Jeor for BMR, sedentary maintenance = BMR × 1.2 (the app's actual target — see
 * domain-rules.md), activity-adjusted maintenance = BMR × a multiplier based on gym days/week.
 * Both figures are always manually overridable — this module only supplies the *default*.
 */

export type Sex = "male" | "female";

/** Standard activity-multiplier scale, keyed by planned gym days per week. */
const ACTIVITY_MULTIPLIERS: Record<number, number> = {
  0: 1.2, // sedentary
  1: 1.375,
  2: 1.375, // lightly active
  3: 1.55,
  4: 1.55, // moderately active
  5: 1.725,
  6: 1.725, // very active
  7: 1.9, // extra active
};

export function ageFromBirthDate(birthDate: string, today: Date = new Date()): number {
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function calculateBMR(params: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
}): number {
  const { sex, age, heightCm, weightKg } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** The app's actual target — see the "Three zones" and weekly budget rules in domain-rules.md. */
export function calculateSedentaryMaintenance(bmr: number): number {
  return Math.round(bmr * 1.2);
}

export function calculateActiveMaintenance(bmr: number, gymDaysPerWeek: number): number {
  const clamped = Math.min(7, Math.max(0, Math.round(gymDaysPerWeek)));
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[clamped]);
}

export function calculateWeeklyBudget(sedentaryMaintenance: number): number {
  return sedentaryMaintenance * 7;
}
