"use client";

import { Activity, Hexagon } from "lucide-react";

export function Header({ modelCount }: { modelCount: number }) {
  return (
    <header className="relative flex items-center justify-between border-b border-border/60 px-6 py-3">
      {/* Subtle top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <Hexagon className="absolute h-8 w-8 text-primary/20" strokeWidth={1.5} />
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            ModelCompare
          </h1>
          <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary">
            PRO
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Model count pill */}
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
            <span className="font-mono text-[9px] font-bold text-primary">
              {modelCount}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            model{modelCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <div className="absolute h-2 w-2 animate-ping rounded-full bg-primary/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground">Online</span>
        </div>
      </div>
    </header>
  );
}
