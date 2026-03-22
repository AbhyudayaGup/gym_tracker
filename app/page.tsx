"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Activity, CalendarDays, Dumbbell } from "lucide-react";
import { readSnapshot, writeSnapshot } from "@/lib/local-store";
import { pullFromServer, pushToServer } from "@/lib/sync";
import { StatusPill } from "@/components/status-pill";
import { SyncButton } from "@/components/sync-button";

export default function HomePage() {
  const [snapshot, setSnapshot] = useState(() => readSnapshot());
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("Local changes ready");

  const stats = useMemo(() => {
    const today = dayjs().format("YYYY-MM-DD");
    const todayLogs = snapshot.logs.filter((log) => log.date === today);
    return {
      exercises: snapshot.exercises.length,
      sessions: snapshot.logs.length,
      today: todayLogs.length,
    };
  }, [snapshot]);

  const handleSync = async () => {
    setSyncing(true);
    setStatus("Sync in progress...");

    const serverSnapshot = await pullFromServer();
    let local = snapshot;

    if (serverSnapshot) {
      const serverTime = new Date(serverSnapshot.updatedAt).getTime();
      const localTime = new Date(snapshot.updatedAt).getTime();
      if (serverTime > localTime) {
        local = serverSnapshot;
        writeSnapshot(serverSnapshot);
        setSnapshot(serverSnapshot);
        setStatus("Server had newer data, pulled latest");
      }
    }

    const pushed = await pushToServer(local);
    if (pushed) {
      writeSnapshot(pushed);
      setSnapshot(pushed);
      setStatus("Synced successfully");
    } else {
      setStatus("Sync failed. Check token and network");
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-4 pb-3">
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Welcome back
            </p>
            <h2 className="text-xl font-bold">Track your next PR</h2>
          </div>
          <StatusPill text={status} kind={status.includes("failed") ? "bad" : "good"} />
        </div>
        <SyncButton onClick={handleSync} syncing={syncing} />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <article className="card p-3">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Exercises
          </p>
          <p className="text-2xl font-bold">{stats.exercises}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Total Logs
          </p>
          <p className="text-2xl font-bold">{stats.sessions}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Today
          </p>
          <p className="text-2xl font-bold">{stats.today}</p>
        </article>
      </section>

      <section className="card p-4">
        <h3 className="mb-3 text-base font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link href="/calendar" className="btn-secondary inline-flex items-center gap-2 justify-center">
            <CalendarDays size={16} />
            Log today workout
          </Link>
          <Link href="/exercises" className="btn-secondary inline-flex items-center gap-2 justify-center">
            <Dumbbell size={16} />
            Manage exercises
          </Link>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Activity size={16} />
          Recent Entries
        </h3>
        {snapshot.logs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No logs yet. Start from the Calendar tab.
          </p>
        ) : (
          <ul className="space-y-2">
            {snapshot.logs
              .slice()
              .reverse()
              .slice(0, 5)
              .map((log) => {
                const exercise = snapshot.exercises.find((item) => item.id === log.exerciseId);
                return (
                  <li key={log.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                    <p className="text-sm font-semibold">{exercise?.name ?? "Unknown exercise"}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {log.date} • {log.sets.map((set) => set.reps).join(" / ")} reps
                    </p>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}
