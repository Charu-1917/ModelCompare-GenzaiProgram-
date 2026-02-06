export interface BenchmarkScore {
  score: number;
  shots?: number;
}

export interface ModelData {
  model_name: string;
  parameter_count: number;
  key_benchmarks: {
    MMLU: BenchmarkScore | null;
    HumanEval: BenchmarkScore | null;
    GSM8K: BenchmarkScore | null;
  };
  memory_footprint_gb: {
    fp16: number | null;
    int8: number | null;
    int4: number | null;
  };
  compression_performance: string | null;
  best_use_case: string;
  one_line_summary: string;
}
