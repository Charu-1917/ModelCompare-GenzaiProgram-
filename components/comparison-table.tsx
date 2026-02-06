"use client";

import type { ModelData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Crown, Trophy } from "lucide-react";

function formatParams(count: number): string {
  if (count >= 1e12) return `${(count / 1e12).toFixed(1)}T`;
  if (count >= 1e9) return `${(count / 1e9).toFixed(1)}B`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(0)}M`;
  return count.toLocaleString();
}

function ScoreCell({
  score,
  isBest,
}: {
  score: number | null | undefined;
  isBest: boolean;
}) {
  if (score == null) {
    return <span className="text-muted-foreground/30">{"--"}</span>;
  }
  return (
    <div className="flex items-center justify-end gap-1.5">
      {isBest && <Crown className="h-3 w-3 text-accent" />}
      <span
        className={`font-mono text-sm ${isBest ? "font-bold text-accent" : "text-foreground"}`}
      >
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function ComparisonTable({ models }: { models: ModelData[] }) {
  if (models.length === 0) return null;

  const getBestScore = (
    getter: (m: ModelData) => number | null | undefined
  ) => {
    const scores = models.map(getter).filter((s): s is number => s != null);
    return scores.length > 0 ? Math.max(...scores) : null;
  };

  const bestMMLU = getBestScore((m) => m.key_benchmarks.MMLU?.score);
  const bestHE = getBestScore((m) => m.key_benchmarks.HumanEval?.score);
  const bestGSM = getBestScore((m) => m.key_benchmarks.GSM8K?.score);
  const smallestFP16 = (() => {
    const vals = models
      .map((m) => m.memory_footprint_gb.fp16)
      .filter((v): v is number => v != null);
    return vals.length > 0 ? Math.min(...vals) : null;
  })();
  const smallestINT4 = (() => {
    const vals = models
      .map((m) => m.memory_footprint_gb.int4)
      .filter((v): v is number => v != null);
    return vals.length > 0 ? Math.min(...vals) : null;
  })();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
      {/* Accent top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          Side-by-Side Comparison
        </h2>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-border/40 bg-secondary/30 px-2.5 py-0.5">
          <Trophy className="h-3 w-3 text-accent" />
          <span className="text-[10px] text-muted-foreground">
            Best scores highlighted
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Model
              </TableHead>
              <TableHead className="py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Params
              </TableHead>
              <TableHead className="py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                MMLU
              </TableHead>
              <TableHead className="py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                HumanEval
              </TableHead>
              <TableHead className="py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                GSM8K
              </TableHead>
              <TableHead className="py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                FP16
              </TableHead>
              <TableHead className="py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                INT4
              </TableHead>
              <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Use Case
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model, idx) => (
              <TableRow
                key={model.model_name}
                className="group border-border/30 transition-colors hover:bg-primary/[0.03]"
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: `hsl(${187 + idx * 40}, 72%, 55%)`,
                      }}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {model.model_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-right font-mono text-sm text-primary">
                  {formatParams(model.parameter_count)}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <ScoreCell
                    score={model.key_benchmarks.MMLU?.score}
                    isBest={model.key_benchmarks.MMLU?.score === bestMMLU}
                  />
                </TableCell>
                <TableCell className="py-3 text-right">
                  <ScoreCell
                    score={model.key_benchmarks.HumanEval?.score}
                    isBest={model.key_benchmarks.HumanEval?.score === bestHE}
                  />
                </TableCell>
                <TableCell className="py-3 text-right">
                  <ScoreCell
                    score={model.key_benchmarks.GSM8K?.score}
                    isBest={model.key_benchmarks.GSM8K?.score === bestGSM}
                  />
                </TableCell>
                <TableCell className="py-3 text-right">
                  <ScoreCell
                    score={model.memory_footprint_gb.fp16}
                    isBest={model.memory_footprint_gb.fp16 === smallestFP16}
                  />
                </TableCell>
                <TableCell className="py-3 text-right">
                  <ScoreCell
                    score={model.memory_footprint_gb.int4}
                    isBest={model.memory_footprint_gb.int4 === smallestINT4}
                  />
                </TableCell>
                <TableCell className="py-3">
                  <span className="rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-secondary-foreground">
                    {model.best_use_case}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
