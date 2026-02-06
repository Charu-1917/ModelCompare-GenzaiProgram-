"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Loader2,
  Trash2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const SAMPLE_TEXT = `We present Llama 3.1 8B, a large language model with 8 billion parameters and a 128K token context window. Llama 3.1 8B achieves 69.4% on MMLU (5-shot), 72.6% on HumanEval, and 84.5% on GSM8K (8-shot). When quantized using GPTQ to 4-bit, the model retains 97% of its original performance with a memory footprint of approximately 4.5 GB. The model excels at coding, reasoning, and multilingual tasks.

Mistral 7B is a 7 billion parameter model optimized for efficient inference and general-purpose chat applications. Mistral 7B achieves 62.5% on MMLU (5-shot), 32.0% on HumanEval, and 73.2% on GSM8K (8-shot). Under INT4 quantization (AWQ), Mistral 7B shows only a 1.8% accuracy degradation with 3.5 GB memory footprint.

Phi-3 3.8B is a compact 3.8 billion parameter model by Microsoft designed for on-device deployment. Phi-3 3.8B scores 75.7% on MMLU (5-shot), 61.0% on HumanEval, and 85.7% on GSM8K (8-shot). With INT4 quantization, Phi-3 achieves a 1.9 GB memory footprint making it suitable for edge reasoning tasks.`;

interface InputPanelProps {
  onExtract: (text: string) => void;
  isLoading: boolean;
  onClear: () => void;
}

export function InputPanel({ onExtract, isLoading, onClear }: InputPanelProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onExtract(text);
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
  };

  const charCount = text.length;

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <FileText className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="text-sm font-medium text-foreground">Paper Input</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
            className="h-7 gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Sparkles className="h-3 w-3" />
            Sample
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setText("");
              onClear();
            }}
            className="h-7 gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Textarea area */}
      <div className="relative flex-1 p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste research paper text here...

Include sections with model names, benchmark scores (MMLU, HumanEval, GSM8K), parameter counts, and quantization results for best extraction."
          className="h-full min-h-[300px] resize-none rounded-lg border-border/50 bg-secondary/30 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
        {/* Character count */}
        <div className="absolute bottom-6 right-6 rounded-md bg-muted px-2 py-0.5">
          <span className="font-mono text-[10px] text-muted-foreground">
            {charCount.toLocaleString()} chars
          </span>
        </div>
      </div>

      {/* Action footer */}
      <div className="border-t border-border/60 px-4 py-3">
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="group relative w-full overflow-hidden rounded-lg bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Extract & Compare
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
          Supports Llama, Mistral, GPT, Phi, Gemma, Claude, and 15+ model
          families
        </p>
      </div>
    </div>
  );
}
