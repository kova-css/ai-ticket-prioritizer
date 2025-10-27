
import type { Ticket, RankedTicket } from '../types';

/**
 * A robust CSV line parser that handles quoted fields.
 * It correctly splits a CSV row into an array of strings,
 * respecting commas inside double quotes and escaped quotes ("").
 * @param line - A single line from a CSV file.
 * @returns An array of column values.
 */
function robustLineParse(line: string): string[] {
    const columns: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"') {
                // Check for an escaped quote ("")
                if (i + 1 < line.length && line[i + 1] === '"') {
                    currentField += '"';
                    i++; // Skip the next quote
                } else {
                    // This is the closing quote for the field
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else { // Not in quotes
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                columns.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
    }
    columns.push(currentField); // Add the last field
    return columns;
}


export function parseCsv(csvText: string): Ticket[] {
  const lines = csvText.trim().replace(/\r/g, '').split('\n');
  if (lines.length < 2 || lines[0].trim() === '') {
    return [];
  }

  // The parser returns raw fields. We need to trim them.
  const headers = robustLineParse(lines[0]).map(header => header.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue; // Skip empty lines

    const values = robustLineParse(line).map(value => value.trim());
    
    if (values.length !== headers.length) {
      throw new Error(`Error parsing CSV on line ${i + 1}: Expected ${headers.length} columns, but found ${values.length}. Please ensure all rows have the same number of columns as the header.`);
    }
    
    const entry: Ticket = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });
    data.push(entry);
  }
  return data;
}

function escapeCsvCell(cell: string | number | string[] | undefined): string {
    if (cell === null || cell === undefined) return '';
    
    const cellStr = Array.isArray(cell) ? cell.join('; ') : String(cell);
    
    if (/[",\n]/.test(cellStr)) {
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
}

export function convertToCsv(data: RankedTicket[]): string {
  if (!data || data.length === 0) {
    return "";
  }
  
  const allHeaders = Object.keys(data[0]);
  const preferredOrder = [
    'priorityRank', 
    'priorityScore', 
    'category', 
    'tags', 
    'urgency', 
    'severity'
  ];
  
  const aiHeaders = preferredOrder.filter(h => allHeaders.includes(h));
  const originalHeaders = allHeaders.filter(key => !preferredOrder.includes(key));
  const headers = [...aiHeaders, ...originalHeaders];

  const headerRow = headers.map(escapeCsvCell).join(',');

  const dataRows = data.map(row => {
    return headers.map(header => {
      const cell = row[header];
      return escapeCsvCell(cell);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}