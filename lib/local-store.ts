"use client";

import { createEmptySnapshot, workoutSnapshotSchema, type WorkoutSnapshot } from "@/types/workout";

const STORAGE_KEY = "gym-flow-snapshot-v1";
const DEVICE_KEY = "gym-flow-device-id";

export const getDeviceId = () => {
  if (typeof window === "undefined") {
    return "server";
  }
  const existing = window.localStorage.getItem(DEVICE_KEY);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_KEY, created);
  return created;
};

export const readSnapshot = (): WorkoutSnapshot => {
  if (typeof window === "undefined") {
    return createEmptySnapshot("server");
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const empty = createEmptySnapshot(getDeviceId());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }

  const parsed = JSON.parse(raw);
  const validated = workoutSnapshotSchema.safeParse(parsed);
  if (!validated.success) {
    const empty = createEmptySnapshot(getDeviceId());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }
  return validated.data;
};

export const writeSnapshot = (snapshot: WorkoutSnapshot) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

export const withSnapshotUpdate = (
  updater: (current: WorkoutSnapshot) => WorkoutSnapshot,
): WorkoutSnapshot => {
  const current = readSnapshot();
  const next = updater(current);
  const updated: WorkoutSnapshot = {
    ...next,
    version: 1,
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
  };
  writeSnapshot(updated);
  return updated;
};
