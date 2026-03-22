"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, House, Menu, Settings, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 pb-24 pt-4 sm:px-6">
      <header className="card fade-up mb-4 flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl p-0"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={`menu-icon-wrap ${menuOpen ? "open" : ""}`}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</span>
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
              Gym Flow
            </p>
            <h1 className="text-lg font-bold">Workout Tracker</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="card p-3">
          <ul className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={`drawer-${href}`}>
                  <Link
                    href={href}
                    className="drawer-link"
                    onClick={() => setMenuOpen(false)}
                    style={active ? { background: "linear-gradient(120deg,var(--accent),var(--accent-2))", color: "white" } : undefined}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <main key={pathname} className="page-transition">
        {children}
      </main>

      <nav
        className={`liquid-nav fixed inset-x-0 bottom-0 mx-auto mb-3 w-[min(520px,calc(100%-1rem))] rounded-2xl border px-2 py-2 backdrop-blur card ${isScrolled ? "is-scrolled" : ""}`}
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
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "nav-link flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium",
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
