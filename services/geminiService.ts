import type { Ticket, AnalysisResult } from "../types";

export async function analyzeTickets(
  tickets: Ticket[],
  ticketContext: string,
  urgencyWeight: number,
  severityWeight: number,
  isCategorizationEnabled: boolean
): Promise<AnalysisResult[]> {
  const res = await fetch("/.netlify/functions/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tickets,
      ticketContext,
      urgencyWeight,
      severityWeight,
      isCategorizationEnabled,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Function error: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Function returned an invalid payload.");
  }
  return data as AnalysisResult[];
}
