"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
export type DarkScheme = "amethyst" | "ocean" | "forest" | "rose" | "carbon";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  darkScheme: DarkScheme;
  setTheme: (theme: Theme) => void;
  setDarkScheme: (scheme: DarkScheme) => void;
};

const STORAGE_KEY = "gym-flow-theme";
const DARK_SCHEME_KEY = "gym-flow-dark-scheme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyThemeClass = (resolvedTheme: "light" | "dark") => {
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
};

const isDarkScheme = (value: string | null): value is DarkScheme => {
  return value === "amethyst" || value === "ocean" || value === "forest" || value === "rose" || value === "carbon";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "system";
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => getSystemTheme());
  const [darkScheme, setDarkSchemeState] = useState<DarkScheme>(() => {
    if (typeof window === "undefined") {
      return "amethyst";
    }
    const stored = window.localStorage.getItem(DARK_SCHEME_KEY);
    return isDarkScheme(stored) ? stored : "amethyst";
  });

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    applyThemeClass(resolvedTheme);
    if (resolvedTheme === "dark") {
      document.documentElement.setAttribute("data-dark-scheme", darkScheme);
    } else {
      document.documentElement.removeAttribute("data-dark-scheme");
    }
  }, [resolvedTheme, darkScheme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  const setDarkScheme = (nextScheme: DarkScheme) => {
    setDarkSchemeState(nextScheme);
    window.localStorage.setItem(DARK_SCHEME_KEY, nextScheme);
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, darkScheme, setTheme, setDarkScheme }),
    [theme, resolvedTheme, darkScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
}
