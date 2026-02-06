"use client";

import {
  Cpu,
  BarChart3,
  HardDrive,
  Zap,
  Code2,
  ArrowLeft,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    label: "Benchmarks",
    detail: "MMLU, HumanEval, GSM8K",
  },
  {
    icon: Cpu,
    label: "Parameters",
    detail: "Auto-detect model size",
  },
  {
    icon: HardDrive,
    label: "Memory",
    detail: "FP16, INT8, INT4 footprint",
  },
  {
    icon: Zap,
    label: "Compression",
    detail: "GPTQ, AWQ quantization",
  },
];

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-12">
      {/* Visual */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-card">
          <Code2 className="h-8 w-8 text-primary/60" />
        </div>
      </div>

      {/* Copy */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h3 className="text-base font-semibold text-foreground">
          Ready to extract
        </h3>
        <p className="max-w-[320px] text-sm leading-relaxed text-muted-foreground">
          Paste a research paper on the left, then hit{" "}
          <span className="font-medium text-primary">
            Extract & Compare
          </span>{" "}
          to analyze model efficiency data.
        </p>
      </div>

      {/* Pointer */}
      <div className="flex items-center gap-2 text-muted-foreground/40">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs">Start by pasting text</span>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature) => (
          <div
            key={feature.label}
            className="flex items-start gap-3 rounded-lg border border-border/30 bg-secondary/20 px-4 py-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <feature.icon className="h-3.5 w-3.5 text-primary/70" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                {feature.label}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {feature.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
