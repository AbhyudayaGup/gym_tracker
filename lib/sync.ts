"use client";

import { workoutSnapshotSchema, type WorkoutSnapshot } from "@/types/workout";

export type SyncState = "idle" | "syncing" | "synced" | "error";

export const pullFromServer = async (): Promise<WorkoutSnapshot | null> => {
  const response = await fetch("/api/sync/pull", { method: "GET" });
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!payload?.snapshot) {
    return null;
  }

  const parsed = workoutSnapshotSchema.safeParse(payload.snapshot);
  return parsed.success ? parsed.data : null;
};

export const pushToServer = async (snapshot: WorkoutSnapshot): Promise<WorkoutSnapshot | null> => {
  const response = await fetch("/api/sync/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const parsed = workoutSnapshotSchema.safeParse(payload.snapshot);
  return parsed.success ? parsed.data : null;
};
