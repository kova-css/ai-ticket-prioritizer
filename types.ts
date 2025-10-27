export type Ticket = Record<string, string>;

export interface RankedTicket {
  urgency: number;
  severity: number;
  priorityScore: number;
  priorityRank: number;
  category?: string;
  tags?: string[];
  // Fix: Explicitly type the `id` property to prevent it from being inferred as a potential array from the index signature.
  // This resolves an issue where `item.id` was not assignable to React's `Key` type.
  id?: string;
  [key: string]: string | number | string[] | undefined;
}

export interface AnalysisResult {
  urgency: number;
  severity: number;
  priorityScore: number;
  category?: string;
  tags?: string[];
}
