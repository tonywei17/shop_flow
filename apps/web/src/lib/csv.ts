export type CsvRow = (string | number | boolean | null | undefined)[];

function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(header: (string | number)[], rows: CsvRow[]): string {
  const lines = [header, ...rows].map((row) => row.map(toCsvCell).join(","));
  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  return bom + lines.join("\r\n");
}
