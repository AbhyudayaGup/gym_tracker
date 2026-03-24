import type { WorkoutSnapshot } from "@/types/workout";

const compareByCompleteness = (left: WorkoutSnapshot, right: WorkoutSnapshot) => {
  const leftTotal = left.exercises.length + left.logs.length;
  const rightTotal = right.exercises.length + right.logs.length;

  if (leftTotal !== rightTotal) {
    return leftTotal - rightTotal;
  }

  if (left.logs.length !== right.logs.length) {
    return left.logs.length - right.logs.length;
  }

  if (left.exercises.length !== right.exercises.length) {
    return left.exercises.length - right.exercises.length;
  }

  const leftTime = new Date(left.updatedAt).getTime();
  const rightTime = new Date(right.updatedAt).getTime();

  if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
    return 0;
  }
  if (Number.isNaN(leftTime)) {
    return -1;
  }
  if (Number.isNaN(rightTime)) {
    return 1;
  }

  return leftTime - rightTime;
};

export const resolvePreferredSnapshot = (
  baseSnapshot: WorkoutSnapshot | null,
  candidateSnapshot: WorkoutSnapshot,
): WorkoutSnapshot => {
  if (!baseSnapshot) {
    return candidateSnapshot;
  }

  return compareByCompleteness(candidateSnapshot, baseSnapshot) >= 0
    ? candidateSnapshot
    : baseSnapshot;
};
