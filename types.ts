export type Ticket = Record<string, string>;

export interface RankedTicket {
  urgency: number;
  severity: number;
  priorityScore: number;
  priorityRank: number;
  category?: string;
  tags?: string[];
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
