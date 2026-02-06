"use client";

import { useState, useCallback } from "react";
import type { ModelData } from "@/lib/types";
import { Header } from "@/components/header";
import { InputPanel } from "@/components/input-panel";
import { ModelCard } from "@/components/model-card";
import { ComparisonTable } from "@/components/comparison-table";
import { JsonExport } from "@/components/json-export";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  LayoutGrid,
  Table2,
  Code2,
  X,
} from "lucide-react";

export function ModelCompareDashboard() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract model data");
      }

      const { data } = await response.json();
      if (data?.models && data.models.length > 0) {
        setModels(data.models);
      } else {
        setError(
          "No model data could be extracted. Make sure the text contains specific model names, benchmark scores, or parameter counts."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setModels([]);
    setError(null);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header modelCount={models.length} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Input */}
        <div className="relative w-full shrink-0 border-r border-border/50 md:w-[380px] lg:w-[420px]">
          {/* Side glow */}
          <div className="pointer-events-none absolute -right-px inset-y-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <InputPanel
            onExtract={handleExtract}
            isLoading={isLoading}
            onClear={handleClear}
          />
        </div>

        {/* Right Panel - Results */}
        <div className="hidden flex-1 flex-col overflow-auto md:flex">
          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-destructive/90">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="shrink-0 text-destructive/50 transition-colors hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {models.length > 0 ? (
            <div className="flex flex-col p-6">
              <Tabs defaultValue="cards">
                <div className="flex items-center justify-between">
                  <TabsList className="h-9 rounded-lg border border-border/40 bg-secondary/30 p-0.5">
                    <TabsTrigger
                      value="cards"
                      className="h-8 gap-1.5 rounded-md px-3 text-xs text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      Cards
                    </TabsTrigger>
                    <TabsTrigger
                      value="table"
                      className="h-8 gap-1.5 rounded-md px-3 text-xs text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <Table2 className="h-3.5 w-3.5" />
                      Table
                    </TabsTrigger>
                    <TabsTrigger
                      value="json"
                      className="h-8 gap-1.5 rounded-md px-3 text-xs text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      JSON
                    </TabsTrigger>
                  </TabsList>

                  <span className="font-mono text-xs text-muted-foreground/50">
                    {models.length} model{models.length !== 1 ? "s" : ""}{" "}
                    extracted
                  </span>
                </div>

                <TabsContent value="cards" className="mt-5">
                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {models.map((model) => (
                      <ModelCard key={model.model_name} model={model} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="table" className="mt-5">
                  <ComparisonTable models={models} />
                </TabsContent>

                <TabsContent value="json" className="mt-5">
                  <JsonExport models={models} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Mobile Results */}
      <div className="flex-1 overflow-auto md:hidden">
        {error && (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="flex-1 text-sm text-destructive/90">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 text-destructive/50 transition-colors hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {models.length > 0 && (
          <div className="flex flex-col gap-4 p-4">
            <Tabs defaultValue="cards">
              <TabsList className="w-full rounded-lg border border-border/40 bg-secondary/30 p-0.5">
                <TabsTrigger
                  value="cards"
                  className="h-8 flex-1 gap-1.5 rounded-md text-xs text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Cards
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="h-8 flex-1 gap-1.5 rounded-md text-xs text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <Table2 className="h-3.5 w-3.5" />
                  Table
                </TabsTrigger>
                <TabsTrigger
                  value="json"
                  className="h-8 flex-1 gap-1.5 rounded-md text-xs text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cards" className="mt-4">
                <div className="flex flex-col gap-4">
                  {models.map((model) => (
                    <ModelCard key={model.model_name} model={model} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-4">
                <ComparisonTable models={models} />
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <JsonExport models={models} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
