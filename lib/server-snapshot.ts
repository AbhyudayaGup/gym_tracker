import { BlobNotFoundError, del, get, put } from "@vercel/blob";
import { createEmptySnapshot, workoutSnapshotSchema, type WorkoutSnapshot } from "@/types/workout";

const BLOB_PATH = "gym-flow/workouts.json";

const getToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
  }
  return token;
};

const isBlobNotFoundError = (error: unknown) => {
  return error instanceof BlobNotFoundError;
};

export const readServerSnapshot = async (): Promise<WorkoutSnapshot | null> => {
  try {
    const blobResult = await get(BLOB_PATH, {
      access: "private",
      useCache: false,
      token: getToken(),
    });

    if (!blobResult || !blobResult.stream) {
      return null;
    }

    const json = await new Response(blobResult.stream).json();
    const parsed = workoutSnapshotSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Stored snapshot is invalid");
    }
    return parsed.data;
  } catch (error) {
    if (isBlobNotFoundError(error)) {
      return null;
    }
    throw error;
  }
};

export const writeServerSnapshot = async (snapshot: WorkoutSnapshot) => {
  await put(BLOB_PATH, JSON.stringify(snapshot), {
    access: "private",
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
