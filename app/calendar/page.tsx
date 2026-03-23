"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { SetEditor } from "@/components/set-editor";
import { generateId } from "@/lib/ids";
import { readSnapshot, withSnapshotUpdate } from "@/lib/local-store";
import { useMounted } from "@/lib/use-mounted";
import type { SetEntry, WorkoutEntry } from "@/types/workout";

const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const mounted = useMounted();
  const [snapshot, setSnapshot] = useState(() => readSnapshot());
  const [currentMonth, setCurrentMonth] = useState(() => dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([{ reps: 10 }]);

  const logsByDate = useMemo(() => {
    const map = new Map<string, WorkoutEntry[]>();
    for (const log of snapshot.logs) {
      const existing = map.get(log.date) ?? [];
      existing.push(log);
      map.set(log.date, existing);
    }
    return map;
  }, [snapshot.logs]);

  const selectedDayLogs = logsByDate.get(selectedDate) ?? [];

  const calendarDays = useMemo(() => {
    const monthStart = currentMonth.startOf("month");
    const monthEnd = currentMonth.endOf("month");
    const start = monthStart.subtract(monthStart.day(), "day");
    const end = monthEnd.add(6 - monthEnd.day(), "day");

    const days: dayjs.Dayjs[] = [];
    let cursor = start;
    while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
      days.push(cursor);
      cursor = cursor.add(1, "day");
    }
    return days;
  }, [currentMonth]);

  if (!mounted) {
    return (
      <div className="space-y-4 pb-3">
        <section className="card p-4">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Loading calendar...
          </p>
        </section>
      </div>
    );
  }

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
      date: selectedDate,
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
      <section className="card fade-up p-4">
        <h2 className="mb-3 text-lg font-bold">Log Workout</h2>
        <div className="space-y-2">
          <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
            Selected day: <span className="font-semibold">{dayjs(selectedDate).format("ddd, MMM D, YYYY")}</span>
          </div>
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
            Add to selected day
          </button>
        </div>
      </section>

      <section className="card fade-up stagger-1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-1 px-3"
            onClick={() => setCurrentMonth((prev) => prev.subtract(1, "month"))}
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <h3 className="text-base font-semibold">{currentMonth.format("MMMM YYYY")}</h3>
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-1 px-3"
            onClick={() => setCurrentMonth((prev) => prev.add(1, "month"))}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2">
          {weekLabels.map((day) => (
            <p key={day} className="text-center text-xs font-semibold" style={{ color: "var(--muted)" }}>
              {day}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const key = day.format("YYYY-MM-DD");
            const inMonth = day.month() === currentMonth.month();
            const isSelected = key === selectedDate;
            const logs = logsByDate.get(key) ?? [];
            return (
              <button
                type="button"
                key={key}
                className={`calendar-cell ${inMonth ? "" : "is-muted"} ${isSelected ? "is-selected" : ""} ${logs.length > 0 ? "has-log" : ""}`}
                onClick={() => {
                  setSelectedDate(key);
                  if (day.month() !== currentMonth.month()) {
                    setCurrentMonth(day.startOf("month"));
                  }
                }}
              >
                <p className="text-xs font-semibold">{day.date()}</p>
                {logs.length > 0 && (
                  <p className="mt-1 text-[10px]" style={{ color: "var(--muted)" }}>
                    {logs.length} workout{logs.length > 1 ? "s" : ""}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card fade-up stagger-2 p-4">
        <h3 className="mb-3 text-base font-semibold">Workouts on {dayjs(selectedDate).format("MMM D, YYYY")}</h3>
        {selectedDayLogs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No workouts logged for this day.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDayLogs.map((log) => {
              const exercise = snapshot.exercises.find((item) => item.id === log.exerciseId);
              return (
                <article key={log.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                  <p className="font-semibold">{exercise?.name ?? "Unknown exercise"}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Sets: {log.sets.map((set) => `${set.reps}${set.weight !== undefined ? `@${set.weight}` : ""}`).join(" • ")}
                  </p>
                  {exercise?.machine && (
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      Seat {exercise.machine.seatHeight || "-"} • Angle {exercise.machine.angle || "-"} • {exercise.machine.loadUnit}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
