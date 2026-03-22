"use client";

import { Plus, Trash2 } from "lucide-react";
import type { SetEntry } from "@/types/workout";

type SetEditorProps = {
  sets: SetEntry[];
  onChange: (sets: SetEntry[]) => void;
};

export function SetEditor({ sets, onChange }: SetEditorProps) {
  return (
    <div className="space-y-2">
      {sets.map((set, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className="field"
            type="number"
            min={1}
            value={set.reps}
            onChange={(event) => {
              const next = [...sets];
              next[index] = { ...set, reps: Number(event.target.value) || 1 };
              onChange(next);
            }}
            placeholder="Reps"
          />
          <input
            className="field"
            type="number"
            min={0}
            value={set.weight ?? ""}
            onChange={(event) => {
              const next = [...sets];
              const value = event.target.value;
              next[index] = { ...set, weight: value === "" ? undefined : Number(value) };
              onChange(next);
            }}
            placeholder="Weight"
          />
          <button
            type="button"
            aria-label="Remove set"
            className="btn-secondary px-3"
            onClick={() => onChange(sets.filter((_, i) => i !== index))}
            disabled={sets.length === 1}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn-secondary inline-flex items-center gap-2"
        onClick={() => onChange([...sets, { reps: 10 }])}
      >
        <Plus size={16} />
        Add set
      </button>
    </div>
  );
}
