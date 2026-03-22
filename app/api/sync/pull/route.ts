import { NextResponse } from "next/server";
import { readServerSnapshot } from "@/lib/server-snapshot";

export async function GET() {
  try {
    const snapshot = await readServerSnapshot();
    return NextResponse.json({ snapshot });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to pull snapshot" },
      { status: 500 },
    );
  }
}
