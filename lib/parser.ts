import type { ModelData } from "@/lib/types";

// Known model name patterns to search for in text
const MODEL_PATTERNS = [
  // Llama family
  /\b(Llama\s*[\d.]+(?:\s*[\d.]+[BbMm])?)/gi,
  // Mistral family
  /\b(Mistral\s*[\d.]+[BbMm]?(?:\s*(?:Instruct|Chat))?)/gi,
  // GPT family
  /\b(GPT-?[\d.]+(?:-(?:turbo|mini))?)/gi,
  // Gemma family
  /\b(Gemma\s*[\d.]+[BbMm]?)/gi,
  // Phi family
  /\b(Phi-?[\d.]+(?:\s*[\d.]+[BbMm])?)/gi,
  // Falcon family
  /\b(Falcon-?[\d.]+[BbMm]?)/gi,
  // Qwen family
  /\b(Qwen-?[\d.]+[BbMm]?)/gi,
  // MPT family
  /\b(MPT-?[\d.]+[BbMm]?)/gi,
  // BLOOM
  /\b(BLOOM-?[\d.]+[BbMm]?)/gi,
  // Vicuna
  /\b(Vicuna-?[\d.]+[BbMm]?)/gi,
  // Claude
  /\b(Claude\s*[\d.]+(?:\s*(?:Opus|Sonnet|Haiku))?)/gi,
  // DeepSeek
  /\b(DeepSeek(?:-?(?:V\d+|Coder|Math))?\s*[\d.]*[BbMm]?)/gi,
  // Yi
  /\b(Yi-?[\d.]+[BbMm]?)/gi,
  // Cohere Command
  /\b(Command(?:\s*R)?(?:\s*[\d.]+)?)/gi,
  // Generic: "the XX model" or "XX (NB parameters)"
  /\b([A-Z][a-zA-Z0-9-]+(?:\s+[\d.]+)?)\s*(?:\(\s*[\d.]+[BbMmTt]\s*(?:parameters?)?\s*\))/g,
];

interface ModelChunk {
  name: string;
  textBlock: string;
}

function normalizeModelName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Split text into blocks around detected model names,
 * associating surrounding sentences with each model.
 */
function findModelChunks(text: string): ModelChunk[] {
  const found = new Map<string, { index: number; name: string }>();

  for (const pattern of MODEL_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const name = normalizeModelName(match[1]);
      const key = name.toLowerCase().replace(/[\s-]+/g, "");
      if (!found.has(key) || match.index < found.get(key)!.index) {
        found.set(key, { index: match.index, name });
      }
    }
  }

  if (found.size === 0) return [];

  // Sort by position in text
  const entries = Array.from(found.values()).sort(
    (a, b) => a.index - b.index
  );

  const chunks: ModelChunk[] = [];
  for (let i = 0; i < entries.length; i++) {
    const start = Math.max(0, entries[i].index - 100);
    const end =
      i + 1 < entries.length
        ? entries[i + 1].index
        : Math.min(text.length, entries[i].index + 1500);
    chunks.push({
      name: entries[i].name,
      textBlock: text.slice(start, end),
    });
  }

  return chunks;
}

function extractParamCount(text: string, modelName: string): number {
  // Look for explicit param counts near the model name
  const nameEscaped = modelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Pattern: "ModelName ... NB parameters" or "ModelName (NB)"
  const patterns = [
    new RegExp(
      nameEscaped + `[^.]*?(\\d+(?:\\.\\d+)?)\\s*[Bb](?:illion)?\\s*(?:parameters?)?`,
      "i"
    ),
    new RegExp(
      `(\\d+(?:\\.\\d+)?)\\s*[Bb](?:illion)?\\s*(?:parameters?)?[^.]*?` + nameEscaped,
      "i"
    ),
    // "8B model" pattern
    new RegExp(nameEscaped + `\\s*(\\d+(?:\\.\\d+)?)[Bb]`, "i"),
    new RegExp(`(\\d+(?:\\.\\d+)?)[Bb]\\s*` + nameEscaped, "i"),
    // In the model name itself
    /([\d.]+)\s*[Bb]/i,
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match?.[1]) {
      return parseFloat(match[1]) * 1e9;
    }
  }

  // Try millions
  const mMatch = text.match(
    new RegExp(
      nameEscaped + `[^.]*?(\\d+(?:\\.\\d+)?)\\s*[Mm](?:illion)?\\s*(?:parameters?)?`,
      "i"
    )
  );
  if (mMatch?.[1]) {
    return parseFloat(mMatch[1]) * 1e6;
  }

  // Try from model name directly, e.g. "Llama 3.1 8B" -> 8B
  const nameMatch = modelName.match(/([\d.]+)\s*[Bb]/i);
  if (nameMatch?.[1]) {
    return parseFloat(nameMatch[1]) * 1e9;
  }

  const nameMMatch = modelName.match(/([\d.]+)\s*[Mm]/i);
  if (nameMMatch?.[1]) {
    return parseFloat(nameMMatch[1]) * 1e6;
  }

  return 0;
}

function extractBenchmark(
  text: string,
  benchmarkName: string
): { score: number; shots?: number } | null {
  const escaped = benchmarkName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Pattern: "BENCHMARK ... score% (N-shot)" or "score on BENCHMARK (N-shot)"
  const patterns = [
    new RegExp(
      escaped + `[^.]*?(\\d+(?:\\.\\d+)?)\\s*%?\\s*(?:on\\s+${escaped})?\\s*(?:\\(\\s*(\\d+)-shot\\s*\\))?`,
      "i"
    ),
    new RegExp(
      `(\\d+(?:\\.\\d+)?)\\s*%?\\s*(?:on|for)\\s+${escaped}\\s*(?:\\(\\s*(\\d+)-shot\\s*\\))?`,
      "i"
    ),
    new RegExp(
      escaped + `\\s*(?:score)?\\s*(?:of|:)?\\s*(\\d+(?:\\.\\d+)?)\\s*%?\\s*(?:\\(\\s*(\\d+)-shot\\s*\\))?`,
      "i"
    ),
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match?.[1]) {
      const score = parseFloat(match[1]);
      if (score > 0 && score <= 100) {
        const result: { score: number; shots?: number } = { score };
        if (match[2]) {
          result.shots = parseInt(match[2], 10);
        } else {
          // Look for shots nearby
          const shotMatch = text.match(
            new RegExp(escaped + `[^.]*?(\\d+)-shot`, "i")
          );
          if (shotMatch?.[1]) {
            result.shots = parseInt(shotMatch[1], 10);
          }
        }
        return result;
      }
    }
  }

  return null;
}

function extractMemory(
  text: string,
  paramCount: number
): { fp16: number | null; int8: number | null; int4: number | null } {
  const result: { fp16: number | null; int8: number | null; int4: number | null } = {
    fp16: null,
    int8: null,
    int4: null,
  };

  // Try to find explicit memory numbers
  const fp16Match = text.match(
    /(?:FP16|fp16|half[- ]precision|16[- ]?bit)[^.]*?([\d.]+)\s*GB/i
  );
  const int8Match = text.match(
    /(?:INT8|int8|8[- ]?bit)[^.]*?([\d.]+)\s*GB/i
  );
  const int4Match = text.match(
    /(?:INT4|int4|4[- ]?bit|GPTQ|AWQ|GGUF)[^.]*?([\d.]+)\s*GB/i
  );

  if (fp16Match?.[1]) result.fp16 = parseFloat(fp16Match[1]);
  if (int8Match?.[1]) result.int8 = parseFloat(int8Match[1]);
  if (int4Match?.[1]) result.int4 = parseFloat(int4Match[1]);

  // Estimate from parameter count if not found
  if (paramCount > 0) {
    if (result.fp16 === null) result.fp16 = Math.round((paramCount * 2) / 1e9 * 10) / 10;
    if (result.int8 === null) result.int8 = Math.round((paramCount * 1) / 1e9 * 10) / 10;
    if (result.int4 === null) result.int4 = Math.round((paramCount * 0.5) / 1e9 * 10) / 10;
  }

  return result;
}

function extractCompression(text: string): string | null {
  const patterns = [
    /(?:quantiz|compress|prun)[^.]*(?:GPTQ|AWQ|GGUF|SqueezeLLM|bitsandbytes|4-bit|8-bit|INT4|INT8)[^.]*/i,
    /(?:GPTQ|AWQ|GGUF|SqueezeLLM)[^.]*(?:accuracy|degradation|drop|loss|performance|retains?)[^.]*/i,
    /(?:4-bit|8-bit|INT4|INT8)\s*quantiz[^.]*(?:\d+(?:\.\d+)?%?)[^.]*/i,
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match?.[0]) {
      let result = match[0].trim();
      // Clean up
      if (result.length > 200) result = result.slice(0, 200) + "...";
      // Capitalize first letter
      result = result.charAt(0).toUpperCase() + result.slice(1);
      return result;
    }
  }

  return null;
}

function inferBestUseCase(
  text: string,
  benchmarks: ModelData["key_benchmarks"]
): string {
  const lower = text.toLowerCase();

  // Check explicit mentions
  if (lower.includes("code") || lower.includes("coding") || lower.includes("programming")) {
    if (
      benchmarks.HumanEval &&
      benchmarks.HumanEval.score > 60
    ) {
      return "coding";
    }
  }

  if (lower.includes("math") || lower.includes("reasoning")) {
    if (benchmarks.GSM8K && benchmarks.GSM8K.score > 70) {
      return "reasoning";
    }
  }

  if (lower.includes("chat") || lower.includes("conversation") || lower.includes("dialogue")) {
    return "chat";
  }

  if (lower.includes("instruction") || lower.includes("instruct")) {
    return "instruction-following";
  }

  if (lower.includes("multilingual") || lower.includes("translation")) {
    return "multilingual";
  }

  // Infer from benchmarks
  if (benchmarks.HumanEval && benchmarks.HumanEval.score > 60) return "coding";
  if (benchmarks.GSM8K && benchmarks.GSM8K.score > 80) return "reasoning";
  if (benchmarks.MMLU && benchmarks.MMLU.score > 70) return "general-purpose";

  return "general-purpose";
}

function buildOneLiner(
  modelName: string,
  paramCount: number,
  benchmarks: ModelData["key_benchmarks"],
  text: string
): string {
  const parts: string[] = [];

  if (paramCount > 0) {
    const paramStr =
      paramCount >= 1e9
        ? `${(paramCount / 1e9).toFixed(1)}B`
        : paramCount >= 1e6
          ? `${(paramCount / 1e6).toFixed(0)}M`
          : `${paramCount}`;
    parts.push(`${paramStr} parameter model`);
  } else {
    parts.push("Model");
  }

  // Context window
  const ctxMatch = text.match(/([\d,]+)\s*[Kk]\s*(?:token)?\s*(?:context|ctx)/);
  if (ctxMatch?.[1]) {
    parts.push(`${ctxMatch[1]}K context`);
  }

  // Highlight strong benchmarks
  const strengths: string[] = [];
  if (benchmarks.MMLU && benchmarks.MMLU.score > 70) strengths.push("knowledge");
  if (benchmarks.HumanEval && benchmarks.HumanEval.score > 50) strengths.push("code");
  if (benchmarks.GSM8K && benchmarks.GSM8K.score > 70) strengths.push("math");

  if (strengths.length > 0) {
    parts.push(`strong on ${strengths.join(", ")}`);
  }

  return parts.join(", ");
}

/**
 * Main parser: extracts ModelData[] from unstructured research paper text.
 */
export function parseModels(text: string): ModelData[] {
  const chunks = findModelChunks(text);

  if (chunks.length === 0) return [];

  // Deduplicate by model name (keep the one with more surrounding text)
  const deduped = new Map<string, ModelChunk>();
  for (const chunk of chunks) {
    const key = chunk.name.toLowerCase().replace(/[\s-]+/g, "");
    if (!deduped.has(key) || chunk.textBlock.length > deduped.get(key)!.textBlock.length) {
      deduped.set(key, chunk);
    }
  }

  const results: ModelData[] = [];

  for (const chunk of deduped.values()) {
    const paramCount = extractParamCount(chunk.textBlock, chunk.name);

    const benchmarks = {
      MMLU: extractBenchmark(chunk.textBlock, "MMLU"),
      HumanEval: extractBenchmark(chunk.textBlock, "HumanEval"),
      GSM8K: extractBenchmark(chunk.textBlock, "GSM8K"),
    };

    const memory = extractMemory(chunk.textBlock, paramCount);
    const compression = extractCompression(chunk.textBlock);
    const bestUse = inferBestUseCase(chunk.textBlock, benchmarks);
    const summary = buildOneLiner(chunk.name, paramCount, benchmarks, chunk.textBlock);

    results.push({
      model_name: chunk.name,
      parameter_count: paramCount,
      key_benchmarks: benchmarks,
      memory_footprint_gb: memory,
      compression_performance: compression,
      best_use_case: bestUse,
      one_line_summary: summary,
    });
  }

  // Sort by parameter count descending
  results.sort((a, b) => b.parameter_count - a.parameter_count);

  return results;
}
