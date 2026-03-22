"use client";

import { Moon, SunMedium } from "lucide-react";
import { useAppTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="btn-secondary inline-flex items-center gap-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className={`menu-icon-wrap ${isDark ? "open" : ""}`}>{isDark ? <SunMedium size={16} /> : <Moon size={16} />}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
