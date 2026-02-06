import { parseModels } from "@/lib/parser";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return Response.json(
        { error: "Please provide research paper text to analyze." },
        { status: 400 }
      );
    }

    const models = parseModels(text);

    return Response.json({ data: { models } });
  } catch (err) {
    console.error("Extraction error:", err);
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during extraction.",
      },
      { status: 500 }
    );
  }
}
