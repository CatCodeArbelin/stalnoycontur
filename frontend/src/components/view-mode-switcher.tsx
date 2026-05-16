"use client";

import { Monitor, Smartphone, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ViewMode = "desktop" | "mobile";

const STORAGE_KEY = "stalnoycontur:view-mode";

const modes: Array<{ value: ViewMode; label: string; Icon: LucideIcon }> = [
  { value: "desktop", label: "Версия для ПК", Icon: Monitor },
  { value: "mobile", label: "Мобильная версия", Icon: Smartphone },
];

function getSavedViewMode(value: string | null): ViewMode | null {
  if (value === "desktop" || value === "mobile") {
    return value;
  }

  return null;
}

function getDefaultViewMode() {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function applyViewMode(mode: ViewMode) {
  document.documentElement.dataset.viewMode = mode;
}

export function ViewModeSwitcher({ className }: { className?: string }) {
  const [mode, setMode] = useState<ViewMode>("desktop");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedMode = getSavedViewMode(window.localStorage.getItem(STORAGE_KEY));
    const nextMode = savedMode ?? getDefaultViewMode();

    setMode(nextMode);
    applyViewMode(nextMode);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, mode);
    applyViewMode(mode);
  }, [isInitialized, mode]);

  return (
    <div className={cn("flex items-center gap-1 rounded-full border border-border bg-card/85 p-1 shadow-card backdrop-blur", className)} aria-label="Переключение версии сайта">
      {modes.map((item) => {
        const active = item.value === mode;

        return (
          <button
            key={item.value}
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-500",
              active && "bg-steel-900 text-white shadow-card hover:bg-steel-900 hover:text-white",
            )}
            aria-label={item.label}
            aria-pressed={active}
            onClick={() => setMode(item.value)}
          >
            <item.Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
