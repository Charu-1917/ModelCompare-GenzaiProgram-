"use client";

import React from "react"

import type { ModelData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Zap, Target, ArrowDownRight } from "lucide-react";

function formatParams(count: number): string {
  if (count >= 1e12) return `${(count / 1e12).toFixed(1)}T`;
  if (count >= 1e9) return `${(count / 1e9).toFixed(1)}B`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(0)}M`;
  return count.toLocaleString();
}

function BenchmarkBar({
  label,
  score,
  shots,
}: {
  label: string;
  score: number;
  shots?: number;
}) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-chart-2";
    if (s >= 60) return "bg-primary";
    if (s >= 40) return "bg-accent";
    return "bg-chart-5";
  };

  const getGlow = (s: number) => {
    if (s >= 80) return "shadow-[0_0_8px_-2px_hsl(142_60%_50%/0.4)]";
    if (s >= 60) return "shadow-[0_0_8px_-2px_hsl(187_72%_55%/0.4)]";
    return "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {label}
          {shots !== undefined && (
            <span className="ml-1 text-muted-foreground/40">
              {shots}-shot
            </span>
          )}
        </span>
        <span className="font-mono text-xs font-bold text-foreground">
          {score.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getColor(score)} ${getGlow(score)}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  value,
  label,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-3">
      <Icon
        className={`h-3.5 w-3.5 ${highlight ? "text-primary" : "text-muted-foreground/60"}`}
      />
      <span
        className={`font-mono text-sm font-bold ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
    </div>
  );
}

export function ModelCard({ model }: { model: ModelData }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:glow-border">
      {/* Accent top bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between px-4 pb-2 pt-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold tracking-tight text-foreground">
            {model.model_name}
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {model.one_line_summary}
          </p>
        </div>
        <Badge className="ml-2 shrink-0 rounded-md border-0 bg-primary/10 font-mono text-[10px] font-medium text-primary hover:bg-primary/10">
          {model.best_use_case}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="mx-4 mt-1 grid grid-cols-3 divide-x divide-border/40 rounded-lg bg-secondary/30">
        <StatBlock
          icon={Cpu}
          value={formatParams(model.parameter_count)}
          label="Params"
          highlight
        />
        <StatBlock
          icon={HardDrive}
          value={
            model.memory_footprint_gb.fp16 !== null
              ? `${model.memory_footprint_gb.fp16.toFixed(1)}`
              : "N/A"
          }
          label="GB FP16"
        />
        <StatBlock
          icon={Zap}
          value={
            model.memory_footprint_gb.int4 !== null
              ? `${model.memory_footprint_gb.int4.toFixed(1)}`
              : "N/A"
          }
          label="GB INT4"
        />
      </div>

      {/* Benchmarks */}
      <div className="flex flex-col gap-3 px-4 pb-2 pt-4">
        <div className="flex items-center gap-1.5">
          <Target className="h-3 w-3 text-primary/60" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Benchmarks
          </span>
        </div>
        {model.key_benchmarks.MMLU && (
          <BenchmarkBar
            label="MMLU"
            score={model.key_benchmarks.MMLU.score}
            shots={model.key_benchmarks.MMLU.shots}
          />
        )}
        {model.key_benchmarks.HumanEval && (
          <BenchmarkBar
            label="HumanEval"
            score={model.key_benchmarks.HumanEval.score}
          />
        )}
        {model.key_benchmarks.GSM8K && (
          <BenchmarkBar
            label="GSM8K"
            score={model.key_benchmarks.GSM8K.score}
            shots={model.key_benchmarks.GSM8K.shots}
          />
        )}
        {!model.key_benchmarks.MMLU &&
          !model.key_benchmarks.HumanEval &&
          !model.key_benchmarks.GSM8K && (
            <p className="text-xs text-muted-foreground/50">
              No benchmark data available
            </p>
          )}
      </div>

      {/* Compression */}
      {model.compression_performance && (
        <div className="mx-4 mb-4 mt-1 rounded-lg border border-accent/10 bg-accent/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <ArrowDownRight className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent/70">
              Compression
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-secondary-foreground">
            {model.compression_performance}
          </p>
        </div>
      )}
    </div>
  );
}
