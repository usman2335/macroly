export type Muscle = {
  id: string;
  name: string;
  muscle_group: string;
};

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function groupMuscles(muscles: Muscle[]): { group: string; muscles: Muscle[] }[] {
  const groups: { group: string; muscles: Muscle[] }[] = [];
  for (const muscle of muscles) {
    let bucket = groups.find((g) => g.group === muscle.muscle_group);
    if (!bucket) {
      bucket = { group: muscle.muscle_group, muscles: [] };
      groups.push(bucket);
    }
    bucket.muscles.push(muscle);
  }
  return groups;
}
