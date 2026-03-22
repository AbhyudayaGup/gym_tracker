"use client";

import clsx from "clsx";

type StatusPillProps = {
  text: string;
  kind: "good" | "warn" | "info" | "bad";
};

const styles = {
  good: { background: "#16a34a22", color: "#16a34a" },
  warn: { background: "#f59e0b22", color: "#d97706" },
  info: { background: "#3b82f622", color: "#2563eb" },
  bad: { background: "#ef444422", color: "#dc2626" },
} as const;

export function StatusPill({ text, kind }: StatusPillProps) {
  return (
    <span
      className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold")}
      style={styles[kind]}
    >
      {text}
    </span>
  );
}
