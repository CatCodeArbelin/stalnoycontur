"use client";

import { Moon, Sun, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "stalnoycontur:theme";
const modes: Array<{ value: ThemeMode; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Темная", icon: Moon },
];

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getFallbackThemeMode(): ThemeMode {
  return getSystemPrefersDark() ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const shouldUseDark = mode === "dark";

  document.documentElement.classList.toggle("dark", shouldUseDark);
  document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    const nextMode = isThemeMode(savedTheme) ? savedTheme : getFallbackThemeMode();

    setMode(nextMode);
    applyTheme(nextMode);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    window.localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
  }, [mode, ready]);

  const activeLabel = useMemo(() => modes.find((item) => item.value === mode)?.label ?? "Светлая", [mode]);

  return (
    <div className={cn("flex items-center gap-1 rounded-full border bg-card/85 p-1 shadow-card backdrop-blur", className)} aria-label={`Тема: ${activeLabel}`}>
      {modes.map((item) => {
        const Icon = item.icon;
        const active = item.value === mode;

        return (
          <button
            key={item.value}
            type="button"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-500",
              active && "bg-primary text-primary-foreground shadow-card hover:bg-primary hover:text-primary-foreground",
            )}
            aria-label={`Включить режим: ${item.label}`}
            aria-pressed={active}
            onClick={() => setMode(item.value)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
