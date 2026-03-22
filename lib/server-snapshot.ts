import { del, head, put } from "@vercel/blob";
import { createEmptySnapshot, workoutSnapshotSchema, type WorkoutSnapshot } from "@/types/workout";

const BLOB_PATH = "gym-flow/workouts.json";

const getToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
  }
  return token;
};

export const readServerSnapshot = async (): Promise<WorkoutSnapshot | null> => {
  try {
    const metadata = await head(BLOB_PATH, {
      token: getToken(),
    });
    const response = await fetch(metadata.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const parsed = workoutSnapshotSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const writeServerSnapshot = async (snapshot: WorkoutSnapshot) => {
  await put(BLOB_PATH, JSON.stringify(snapshot), {
    access: "public",
    token: getToken(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
};

export const resetServerSnapshot = async () => {
  try {
    await del(BLOB_PATH, { token: getToken() });
  } catch {
    return;
  }
};

export const resolveLastWriteWins = (
  serverSnapshot: WorkoutSnapshot | null,
  incomingSnapshot: WorkoutSnapshot,
): WorkoutSnapshot => {
  if (!serverSnapshot) {
    return incomingSnapshot;
  }

  const serverTime = new Date(serverSnapshot.updatedAt).getTime();
  const incomingTime = new Date(incomingSnapshot.updatedAt).getTime();

  if (Number.isNaN(serverTime)) {
    return incomingSnapshot;
  }
  if (Number.isNaN(incomingTime)) {
    return serverSnapshot;
  }

  return incomingTime >= serverTime ? incomingSnapshot : serverSnapshot;
};

export const emptyServerSnapshot = (deviceId: string) => createEmptySnapshot(deviceId);
