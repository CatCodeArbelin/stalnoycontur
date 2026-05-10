import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("inline-flex items-center rounded-full border border-copper-400/30 bg-copper-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-copper-600", className)}
      {...props}
    />
  );
}
