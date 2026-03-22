"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarPlus } from "lucide-react";
import { SetEditor } from "@/components/set-editor";
import { generateId } from "@/lib/ids";
import { readSnapshot, withSnapshotUpdate } from "@/lib/local-store";
import type { SetEntry, WorkoutEntry } from "@/types/workout";

export default function CalendarPage() {
  const [snapshot, setSnapshot] = useState(() => readSnapshot());
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([{ reps: 10 }]);

  const grouped = useMemo(() => {
    const map = new Map<string, WorkoutEntry[]>();
    for (const log of snapshot.logs) {
      const existing = map.get(log.date) ?? [];
      existing.push(log);
      map.set(log.date, existing);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [snapshot.logs]);

  const addLog = () => {
    if (!exerciseId || sets.length === 0) {
      return;
    }

    const cleanSets = sets
      .filter((set) => set.reps > 0)
      .map((set) => ({ reps: Number(set.reps), weight: set.weight !== undefined ? Number(set.weight) : undefined }));

    if (cleanSets.length === 0) {
      return;
    }

    const entry: WorkoutEntry = {
      id: generateId(),
      date,
      exerciseId,
      sets: cleanSets,
      createdAt: new Date().toISOString(),
    };

    const updated = withSnapshotUpdate((current) => ({
      ...current,
      logs: [...current.logs, entry],
    }));

    setSnapshot(updated);
    setSets([{ reps: 10 }]);
  };

  return (
    <div className="space-y-4 pb-3">
      <section className="card p-4">
        <h2 className="mb-3 text-lg font-bold">Log Workout</h2>
        <div className="space-y-2">
          <input className="field" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <select className="field" value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
            <option value="">Choose exercise</option>
            {snapshot.exercises.map((exercise) => (
              <option value={exercise.id} key={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <SetEditor sets={sets} onChange={setSets} />
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={addLog}>
            <CalendarPlus size={16} />
            Add to calendar
          </button>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="mb-3 text-base font-semibold">Calendar History</h3>
        {grouped.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No calendar entries yet.
          </p>
        ) : (
          <div className="space-y-3">
            {grouped.map(([groupDate, logs]) => (
              <article key={groupDate} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                <p className="mb-2 text-sm font-semibold">{groupDate}</p>
                <ul className="space-y-1">
                  {logs.map((log) => {
                    const exercise = snapshot.exercises.find((item) => item.id === log.exerciseId);
                    return (
                      <li key={log.id} className="text-sm" style={{ color: "var(--muted)" }}>
                        {exercise?.name ?? "Unknown"}: {log.sets.map((set) => set.reps).join(" / ")} reps
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
