"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, House, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 pb-24 pt-4 sm:px-6">
      <header className="card fade-up mb-4 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
            Gym Flow
          </p>
          <h1 className="text-lg font-bold">Workout Tracker</h1>
        </div>
        <ThemeToggle />
      </header>

      <main>{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 mx-auto mb-3 w-[min(520px,calc(100%-1rem))] rounded-2xl border px-2 py-2 backdrop-blur card"
        style={{
          background: "linear-gradient(150deg, color-mix(in oklab, var(--card) 90%, var(--accent) 10%), color-mix(in oklab, var(--card) 92%, var(--accent-3) 8%))",
        }}
      >
        <ul className="grid grid-cols-4 gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium",
                    active ? "text-white" : "",
                  )}
                  style={
                    active
                      ? { background: "linear-gradient(120deg,var(--accent),var(--accent-2))" }
                      : { color: "var(--muted)" }
                  }
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
