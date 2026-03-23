"use client";

import { useSyncExternalStore } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useAppTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useAppTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="theme-slider"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <SunMedium size={14} className="theme-slider-icon" />
      <span className={`theme-slider-track ${isDark ? "is-dark" : ""}`}>
        <span className="theme-slider-thumb" />
      </span>
      <Moon size={14} className="theme-slider-icon" />
    </button>
  );
}
