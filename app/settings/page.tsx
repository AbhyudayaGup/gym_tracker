"use client";

import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { readSnapshot, writeSnapshot } from "@/lib/local-store";
import { workoutSnapshotSchema } from "@/types/workout";

export default function SettingsPage() {
  const [message, setMessage] = useState("Manage your backup safely");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const snapshot = readSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gym-flow-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Backup exported");
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      const validated = workoutSnapshotSchema.safeParse(parsed);
      if (!validated.success) {
        setMessage("Invalid backup file format");
        return;
      }
      writeSnapshot(validated.data);
      setMessage("Backup imported successfully");
    } catch {
      setMessage("Could not read backup file");
    }
  };

  const handleReset = () => {
    if (!window.confirm("Reset local data? This cannot be undone.")) {
      return;
    }
    const empty = {
      version: 1 as const,
      updatedAt: new Date().toISOString(),
      deviceId: crypto.randomUUID(),
      exercises: [],
      logs: [],
    };
    writeSnapshot(empty);
    setMessage("Local data reset");
  };

  return (
    <div className="space-y-4 pb-3">
      <section className="card p-4">
        <h2 className="mb-3 text-lg font-bold">Backup & Restore</h2>
        <p className="mb-3 text-sm" style={{ color: "var(--muted)" }}>
          {message}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" className="btn-secondary inline-flex items-center justify-center gap-2" onClick={handleExport}>
            <Download size={16} />
            Export JSON
          </button>
          <button
            type="button"
            className="btn-secondary inline-flex items-center justify-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            Import JSON
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleImport(file);
            }
          }}
        />
      </section>

      <section className="card p-4">
        <h3 className="mb-3 text-base font-semibold">Danger Zone</h3>
        <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={handleReset}>
          <Trash2 size={16} />
          Reset local data
        </button>
      </section>
    </div>
  );
}
