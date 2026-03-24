"use client";

import { workoutSnapshotSchema, type WorkoutSnapshot } from "@/types/workout";

export type SyncState = "idle" | "syncing" | "synced" | "error";

export type SyncResponse = {
  snapshot: WorkoutSnapshot | null;
  error: string | null;
};

export const pullFromServer = async (): Promise<SyncResponse> => {
  const response = await fetch("/api/sync/pull", { method: "GET" });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return { snapshot: null, error: payload?.error ?? "Pull failed" };
  }

  if (!payload?.snapshot) {
    return { snapshot: null, error: null };
  }

  const parsed = workoutSnapshotSchema.safeParse(payload.snapshot);
  if (!parsed.success) {
    return { snapshot: null, error: "Server snapshot format is invalid" };
  }

  return { snapshot: parsed.data, error: null };
};

export const pushToServer = async (snapshot: WorkoutSnapshot): Promise<SyncResponse> => {
  const response = await fetch("/api/sync/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return { snapshot: null, error: payload?.error ?? "Push failed" };
  }

  const parsed = workoutSnapshotSchema.safeParse(payload.snapshot);
  if (!parsed.success) {
    return { snapshot: null, error: "Server response snapshot format is invalid" };
  }

  return { snapshot: parsed.data, error: null };
};
