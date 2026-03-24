import { NextResponse } from "next/server";
import { resolvePreferredSnapshot, readServerSnapshot, writeServerSnapshot } from "@/lib/server-snapshot";
import { workoutSnapshotSchema } from "@/types/workout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = workoutSnapshotSchema.safeParse(body?.snapshot);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid snapshot format" }, { status: 400 });
    }

    const incoming = parsed.data;
    const server = await readServerSnapshot();
    const canonical = resolvePreferredSnapshot(server, incoming);
    await writeServerSnapshot(canonical);

    return NextResponse.json({ snapshot: canonical });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Failed to push snapshot: ${error.message}`
            : "Failed to push snapshot",
      },
      { status: 500 },
    );
  }
}
