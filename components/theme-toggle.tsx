"use client";

import { useSyncExternalStore } from "react";
import type { DarkScheme } from "@/components/theme-provider";
import { useAppTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, setDarkScheme, resolvedTheme, darkScheme } = useAppTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const selectedValue = mounted ? (resolvedTheme === "light" ? "light" : `dark-${darkScheme}`) : "light";

  const handleChange = (value: string) => {
    if (value === "light") {
      setTheme("light");
      return;
    }

    const nextScheme = value.replace("dark-", "") as DarkScheme;
    setDarkScheme(nextScheme);
    setTheme("dark");
  };

  return (
    <label className="theme-debug-wrap">
      <span className="theme-debug-label">Theme Debug</span>
      <select
        aria-label="Theme debug selector"
        className="theme-debug-select"
        value={selectedValue}
        onChange={(event) => handleChange(event.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark-amethyst">Dark · Amethyst</option>
        <option value="dark-ocean">Dark · Ocean</option>
        <option value="dark-forest">Dark · Forest</option>
        <option value="dark-rose">Dark · Rose</option>
        <option value="dark-carbon">Dark · Carbon</option>
      </select>
    </label>
  );
}
