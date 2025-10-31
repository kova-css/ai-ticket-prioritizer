
import { GoogleGenAI } from "@google/genai";

type Ticket = Record<string, unknown>;

function buildResponseSchema(isCategorizationEnabled: boolean) {
  const properties: Record<string, any> = {
    urgency: { type: "number", description: "1.0 to 10.0 urgency score" },
    severity: { type: "number", description: "1.0 to 10.0 severity score" },
    priorityScore: { type: "number", description: "Computed priority score" },
  };

  const required = ["urgency", "severity", "priorityScore"];

  if (isCategorizationEnabled) {
    properties.category = { type: "string", description: "Short category" };
    properties.tags = {
      type: "array",
      items: { type: "string" },
      description: "1–3 keywords",
    };
  }

  return {
    type: "array",
    items: {
      type: "object",
      properties,
      required,
    },
  };
}

const CHUNK_SIZE = 25;

async function analyzeChunk(
  ai: GoogleGenAI,
  chunk: Ticket[],
  ticketContext: string,
  urgencyWeight: number,
  severityWeight: number,
  isCategorizationEnabled: boolean
) {
  const priorityFormula = `(urgency * ${urgencyWeight}) + (severity * ${severityWeight})`;

  const categorizationInstructions = isCategorizationEnabled
    ? `
Additionally, for each ticket, provide a 'category' and an array of 1-3 relevant 'tags'.`
    : "";

  const prompt = `
You are an expert product manager specializing in prioritizing ${ticketContext}.
Analyze the following JSON array of tickets. For each ticket, evaluate its urgency and severity.
- Urgency is based on customer impact, blockers, or keywords like 'critical', 'urgent', 'blocker', 'down'.
- Severity is based on technical impact like data loss, security vulnerabilities, crashes, or frequency.

Give floating-point scores from 1.0 (lowest) to 10.0 (highest) for Urgency and Severity.
Then, calculate a Priority Score using this exact formula: ${priorityFormula}.
${categorizationInstructions}

Return a JSON array of the same length as the input, preserving order.

Input Tickets:
${JSON.stringify(chunk, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: buildResponseSchema(isCategorizationEnabled),
    },
  });

  const text = (response as any).text?.trim?.() ?? "";
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error("AI response for a chunk was not a valid array.");
  }
  return data;
}

export default async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const {
    tickets,
    ticketContext,
    urgencyWeight,
    severityWeight,
    isCategorizationEnabled,
  } = await request.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Missing GEMINI_API_KEY", { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const chunks: Ticket[][] = [];
  for (let i = 0; i < tickets.length; i += CHUNK_SIZE) {
    chunks.push(tickets.slice(i, i + CHUNK_SIZE));
  }

  try {
    const results = await Promise.all(
      chunks.map((chunk) =>
        analyzeChunk(
          ai,
          chunk,
          ticketContext,
          urgencyWeight,
          severityWeight,
          isCategorizationEnabled
        )
      )
    );
    const flat = results.flat();
    return Response.json(flat);
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "Failed to get analysis from AI", detail: e?.message ?? String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
