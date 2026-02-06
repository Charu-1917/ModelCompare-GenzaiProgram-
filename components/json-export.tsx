"use client";

import { useState } from "react";
import type { ModelData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check, Copy, Code2, Download } from "lucide-react";

export function JsonExport({ models }: { models: ModelData[] }) {
  const [copied, setCopied] = useState(false);

  if (models.length === 0) return null;

  const jsonString = JSON.stringify(models, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model-comparison.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
      {/* Accent top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <Code2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Structured Output
          </h2>
          <span className="rounded-md bg-secondary/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            JSON
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-chart-2" />
                <span className="text-chart-2">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative max-h-[500px] overflow-auto p-5">
        {/* Line numbers gutter effect */}
        <pre className="font-mono text-xs leading-6 text-secondary-foreground">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
}
