"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { generateId } from "@/lib/ids";
import { readSnapshot, withSnapshotUpdate } from "@/lib/local-store";
import type { Exercise, MachineSpec } from "@/types/workout";

const initialMachine: MachineSpec = {
  machineName: "",
  seatHeight: "",
  angle: "",
  loadUnit: "kg",
  notes: "",
};

export default function ExercisesPage() {
  const [snapshot, setSnapshot] = useState(() => readSnapshot());
  const [name, setName] = useState("");
  const [machine, setMachine] = useState<MachineSpec>(initialMachine);

  const sortedExercises = useMemo(
    () => snapshot.exercises.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [snapshot.exercises],
  );

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
    setName("");
    setMachine(initialMachine);
  };

  return (
    <div className="space-y-4 pb-3">
      <section className="card p-4">
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

      <section className="card p-4">
        <h3 className="mb-3 text-base font-semibold">Saved Exercises</h3>
        {sortedExercises.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No exercises yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {sortedExercises.map((exercise) => (
              <li key={exercise.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                <p className="font-semibold">{exercise.name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {exercise.machine.machineName} • Seat {exercise.machine.seatHeight || "-"} • Angle {exercise.machine.angle || "-"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
