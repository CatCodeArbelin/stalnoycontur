"use client";

import { MonitorSmartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ViewMode = "site" | "mobile-preview" | "compact";

const STORAGE_KEY = "stalnoycontur:view-mode";

const modes: Array<{ value: ViewMode; label: string; shortLabel: string }> = [
  { value: "site", label: "Сайт", shortLabel: "С" },
  { value: "mobile-preview", label: "Мобильный preview", shortLabel: "М" },
  { value: "compact", label: "Компактно", shortLabel: "К" },
];

function isViewMode(value: string | null): value is ViewMode {
  return value === "site" || value === "mobile-preview" || value === "compact";
}

function applyViewMode(mode: ViewMode) {
  document.documentElement.dataset.viewMode = mode;
}

export function ViewModeSwitcher({ className }: { className?: string }) {
  const [mode, setMode] = useState<ViewMode>("site");

  useEffect(() => {
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    const nextMode = isViewMode(savedMode) ? savedMode : "site";

    setMode(nextMode);
    applyViewMode(nextMode);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    applyViewMode(mode);
  }, [mode]);

  const activeLabel = useMemo(() => modes.find((item) => item.value === mode)?.label ?? "Сайт", [mode]);

  return (
    <div className={cn("flex items-center gap-1 rounded-full border border-border bg-card/85 p-1 shadow-card backdrop-blur", className)} aria-label={`Режим отображения: ${activeLabel}`}>
      <MonitorSmartphone className="hidden h-4 w-4 shrink-0 text-muted-foreground xl:block" aria-hidden="true" />
      {modes.map((item) => {
        const active = item.value === mode;

        return (
          <button
            key={item.value}
            type="button"
            className={cn(
              "rounded-full px-2 py-1.5 text-[11px] font-black leading-none text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-500 sm:text-xs",
              active && "bg-steel-900 text-white shadow-card hover:bg-steel-900 hover:text-white",
            )}
            aria-pressed={active}
            onClick={() => setMode(item.value)}
          >
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
