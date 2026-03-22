"use client";

import { RefreshCw } from "lucide-react";

type SyncButtonProps = {
  onClick: () => Promise<void>;
  syncing: boolean;
  label?: string;
};

export function SyncButton({ onClick, syncing, label = "Sync now" }: SyncButtonProps) {
  return (
    <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => void onClick()} disabled={syncing}>
      <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
      {syncing ? "Syncing..." : label}
    </button>
  );
}
