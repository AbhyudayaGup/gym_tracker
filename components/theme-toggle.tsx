"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useAppTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="btn-secondary inline-flex items-center gap-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className={`menu-icon-wrap ${isDark ? "open" : ""}`}>{isDark ? <SunMedium size={16} /> : <Moon size={16} />}</span>
      <span>{mounted ? (isDark ? "Light" : "Dark") : "Theme"}</span>
    </button>
  );
}
