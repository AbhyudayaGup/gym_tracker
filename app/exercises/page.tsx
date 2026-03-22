"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/lib/ids";
import { readSnapshot, withSnapshotUpdate, writeSnapshot } from "@/lib/local-store";
import type { Exercise, MachineSpec } from "@/types/workout";

const initialMachine: MachineSpec = {
  machineName: "",
  seatHeight: "",
  angle: "",
  loadUnit: "kg",
  notes: "",
};

const popularExercises = [
  { name: "Barbell Bench Press", machineName: "Flat Bench + Barbell" },
  { name: "Incline Dumbbell Press", machineName: "Adjustable Bench" },
  { name: "Machine Chest Press", machineName: "Chest Press Machine" },
  { name: "Pec Deck Fly", machineName: "Pec Deck" },
  { name: "Lat Pulldown", machineName: "Cable Lat Pulldown" },
  { name: "Seated Cable Row", machineName: "Cable Row Machine" },
  { name: "Chest-Supported Row", machineName: "Chest-Supported Row Machine" },
  { name: "Assisted Pull-Up", machineName: "Assisted Pull-Up Machine" },
  { name: "Barbell Back Squat", machineName: "Squat Rack" },
  { name: "Leg Press", machineName: "45° Leg Press" },
  { name: "Hack Squat", machineName: "Hack Squat Machine" },
  { name: "Walking Lunge", machineName: "Open Floor / Dumbbells" },
  { name: "Romanian Deadlift", machineName: "Barbell" },
  { name: "Leg Extension", machineName: "Leg Extension Machine" },
  { name: "Seated Leg Curl", machineName: "Leg Curl Machine" },
  { name: "Hip Thrust", machineName: "Bench + Barbell" },
  { name: "Standing Calf Raise", machineName: "Calf Raise Machine" },
  { name: "Seated Calf Raise", machineName: "Seated Calf Machine" },
  { name: "Overhead Press", machineName: "Barbell / Rack" },
  { name: "Machine Shoulder Press", machineName: "Shoulder Press Machine" },
  { name: "Dumbbell Lateral Raise", machineName: "Dumbbells" },
  { name: "Cable Face Pull", machineName: "Cable Station" },
  { name: "Barbell Curl", machineName: "Barbell" },
  { name: "Preacher Curl", machineName: "Preacher Bench / EZ Bar" },
  { name: "Hammer Curl", machineName: "Dumbbells" },
  { name: "Triceps Pushdown", machineName: "Cable Station" },
  { name: "Overhead Triceps Extension", machineName: "Cable / Dumbbell" },
  { name: "Cable Crunch", machineName: "Cable Station" },
  { name: "Hanging Knee Raise", machineName: "Captain's Chair" },
  { name: "Plank", machineName: "Mat" },
];

const normalize = (value: string) => value.trim().toLowerCase();

export default function ExercisesPage() {
  const [snapshot, setSnapshot] = useState(() => {
    const base = readSnapshot();
    const existingNames = new Set(base.exercises.map((exercise) => normalize(exercise.name)));
    const toAdd = popularExercises
      .filter((exercise) => !existingNames.has(normalize(exercise.name)))
      .map((exercise) => ({
        id: generateId(),
        name: exercise.name,
        machine: {
          machineName: exercise.machineName,
          seatHeight: "",
          angle: "",
          loadUnit: "kg" as const,
          notes: "",
        },
        createdAt: new Date().toISOString(),
      }));

    if (toAdd.length === 0) {
      return base;
    }

    const next = {
      ...base,
      exercises: [...base.exercises, ...toAdd],
      updatedAt: new Date().toISOString(),
    };
    writeSnapshot(next);
    return next;
  });
  const [name, setName] = useState("");
  const [machine, setMachine] = useState<MachineSpec>(initialMachine);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const historySectionRef = useRef<HTMLElement | null>(null);

  const sortedExercises = useMemo(
    () => snapshot.exercises.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [snapshot.exercises],
  );

  const selectedExercise = sortedExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;

  const filteredExercises = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return sortedExercises;
    }

    return sortedExercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(query) ||
        exercise.machine.machineName.toLowerCase().includes(query) ||
        (exercise.machine.notes ?? "").toLowerCase().includes(query),
    );
  }, [searchTerm, sortedExercises]);

  const selectedExerciseLogs = useMemo(() => {
    if (!selectedExerciseId) {
      return [];
    }
    return snapshot.logs
      .filter((log) => log.exerciseId === selectedExerciseId)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedExerciseId, snapshot.logs]);

  const addExercise = () => {
    if (!name.trim() || !machine.machineName.trim()) {
      return;
    }

    const exercise: Exercise = {
      id: generateId(),
      name: name.trim(),
      machine: {
        ...machine,
        machineName: machine.machineName.trim(),
      },
      createdAt: new Date().toISOString(),
    };

    const updated = withSnapshotUpdate((current) => ({
      ...current,
      exercises: [...current.exercises, exercise],
    }));

    setSnapshot(updated);
    setSelectedExerciseId(exercise.id);
    setName("");
    setMachine(initialMachine);
  };

  const deleteExercise = (exerciseId: string) => {
    const target = snapshot.exercises.find((exercise) => exercise.id === exerciseId);
    if (!target) {
      return;
    }

    const shouldDelete = window.confirm(`Delete ${target.name}? Related workout logs for this exercise will also be removed.`);
    if (!shouldDelete) {
      return;
    }

    const updated = withSnapshotUpdate((current) => ({
      ...current,
      exercises: current.exercises.filter((exercise) => exercise.id !== exerciseId),
      logs: current.logs.filter((log) => log.exerciseId !== exerciseId),
    }));

    setSnapshot(updated);
    if (selectedExerciseId === exerciseId) {
      setSelectedExerciseId(updated.exercises[0]?.id ?? "");
    }
  };

  const openExerciseHistory = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    window.setTimeout(() => {
      historySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 20);
  };

  return (
    <div className="space-y-4 pb-3">
      <section className="card fade-up p-4">
        <h2 className="mb-3 text-lg font-bold">Add Exercise</h2>
        <div className="space-y-2">
          <input className="field" placeholder="Exercise name" value={name} onChange={(event) => setName(event.target.value)} />
          <input
            className="field"
            placeholder="Machine name"
            value={machine.machineName}
            onChange={(event) => setMachine((prev) => ({ ...prev, machineName: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="field"
              placeholder="Seat height"
              value={machine.seatHeight}
              onChange={(event) => setMachine((prev) => ({ ...prev, seatHeight: event.target.value }))}
            />
            <input
              className="field"
              placeholder="Angle"
              value={machine.angle}
              onChange={(event) => setMachine((prev) => ({ ...prev, angle: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="field"
              value={machine.loadUnit}
              onChange={(event) =>
                setMachine((prev) => ({
                  ...prev,
                  loadUnit: event.target.value as MachineSpec["loadUnit"],
                }))
              }
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="plates">plates</option>
            </select>
            <input
              className="field"
              placeholder="Machine notes"
              value={machine.notes}
              onChange={(event) => setMachine((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={addExercise}>
            <Plus size={16} />
            Save exercise
          </button>
        </div>
      </section>

      <section className="card fade-up stagger-1 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">Saved Exercises</h3>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Includes popular common exercises
          </p>
        </div>
        <input
          className="field mb-3"
          placeholder="Search saved exercises..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {sortedExercises.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No exercises yet.
          </p>
        ) : filteredExercises.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No saved exercises match your search.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredExercises.map((exercise) => (
              <li key={exercise.id}>
                <div className="exercise-item rounded-xl border p-1 transition" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start gap-2">
                    <button type="button" className="flex-1 rounded-lg p-2 text-left" onClick={() => openExerciseHistory(exercise.id)}>
                      <p className="exercise-name font-semibold">{exercise.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {exercise.machine.machineName} • Seat {exercise.machine.seatHeight || "-"} • Angle {exercise.machine.angle || "-"}
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${exercise.name}`}
                      className="btn-secondary danger-btn px-3 py-2"
                      onClick={() => deleteExercise(exercise.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section ref={historySectionRef} className="card fade-up stagger-2 p-4">
        <h3 className="mb-3 text-base font-semibold">Exercise History</h3>
        {!selectedExercise ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Tap any saved exercise to see every workout you have logged for it.
          </p>
        ) : selectedExerciseLogs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No workouts logged yet for <span className="font-semibold">{selectedExercise.name}</span>.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              {selectedExercise.name} • {selectedExerciseLogs.length} session{selectedExerciseLogs.length > 1 ? "s" : ""}
            </p>
            {selectedExerciseLogs.map((log) => (
              <article key={log.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-semibold">{log.date}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Sets: {log.sets.map((set) => `${set.reps}${set.weight !== undefined ? `@${set.weight}` : ""}`).join(" • ")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
