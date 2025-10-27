import { GoogleGenAI, Type } from "@google/genai";
import type { Ticket, AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Process tickets in parallel chunks to improve performance for large inputs
const CHUNK_SIZE = 25;

function buildResponseSchema(isCategorizationEnabled: boolean) {
  const properties: Record<string, any> = {
    urgency: {
      type: Type.NUMBER,
      description: "A floating-point score from 1.0 (lowest) to 10.0 (highest) representing how urgently the ticket needs to be addressed based on user impact.",
    },
    severity: {
      type: Type.NUMBER,
      description: "A floating-point score from 1.0 (lowest) to 10.0 (highest) representing the technical severity of the issue (e.g., data loss, security flaw).",
    },
    priorityScore: {
      type: Type.NUMBER,
      description: "The calculated priority score based on the provided formula.",
    },
  };

  const required = ["urgency", "severity", "priorityScore"];

  if (isCategorizationEnabled) {
    properties.category = {
      type: Type.STRING,
      description: "A concise category for the ticket (e.g., 'UI Bug', 'Backend', 'Feature Request').",
    };
    properties.tags = {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 1-3 relevant keywords or tags for grouping.",
    };
  }
  
  return {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: properties,
      required: required,
    },
  };
}

async function analyzeChunk(
  chunk: Ticket[],
  ticketContext: string,
  urgencyWeight: number,
  severityWeight: number,
  isCategorizationEnabled: boolean
): Promise<AnalysisResult[]> {
  const priorityFormula = `(urgency * ${urgencyWeight}) + (severity * ${severityWeight})`;

  const categorizationInstructions = isCategorizationEnabled 
    ? `
    Additionally, for each ticket, provide a 'category' (e.g., 'UI Bug', 'Data Integrity', 'Performance') and an array of 1-3 relevant 'tags' for filtering and grouping.`
    : '';

  const prompt = `
    You are an expert product manager specializing in prioritizing ${ticketContext}.
    Analyze the following JSON array of tickets. For each ticket, evaluate its urgency and severity.
    - Urgency should be based on factors like customer impact, project blockers, or keywords like 'critical', 'urgent', 'blocker', 'down'.
    - Severity should be based on the technical impact, such as data loss, security vulnerabilities, system crashes, or frequency of the issue.
    
    Based on your analysis, provide a score from 1.0 (lowest) to 10.0 (highest) for both Urgency and Severity. These scores can be floating-point numbers for greater precision.
    Then, calculate a Priority Score using this exact formula: ${priorityFormula}.
    ${categorizationInstructions}

    Return a JSON array of the same length as the input. Each object in your response array must correspond to a ticket in the input array, in the same order.

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

  const responseText = response.text.trim();
  const result = JSON.parse(responseText);

  if (!Array.isArray(result)) {
      throw new Error("AI response for a chunk was not a valid array.");
  }
  
  return result as AnalysisResult[];
}


export async function analyzeTickets(
  tickets: Ticket[], 
  ticketContext: string,
  urgencyWeight: number,
  severityWeight: number,
  isCategorizationEnabled: boolean
): Promise<AnalysisResult[]> {
  
  const chunks: Ticket[][] = [];
  for (let i = 0; i < tickets.length; i += CHUNK_SIZE) {
    chunks.push(tickets.slice(i, i + CHUNK_SIZE));
  }

  try {
    const analysisPromises = chunks.map(chunk => 
      analyzeChunk(chunk, ticketContext, urgencyWeight, severityWeight, isCategorizationEnabled)
    );

    const chunkResults = await Promise.all(analysisPromises);
    
    const allResults = chunkResults.flat();
    
    if (allResults.length !== tickets.length) {
      console.warn(`Mismatch in results length. Expected ${tickets.length}, got ${allResults.length}`);
    }
    
    return allResults;

  } catch (error) {
    console.error("Error calling Gemini API in parallel:", error);
    throw new Error("Failed to get analysis from AI. One of the processing batches failed. This is probably on Google's side. Please try again later.");
  }
}