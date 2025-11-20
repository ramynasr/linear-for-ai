/**
 * Truncate string to max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Pad string to specified width
 */
function pad(str: string, width: number): string {
  if (str.length >= width) return str;
  return str + ' '.repeat(width - str.length);
}

/**
 * Calculate column widths based on content
 */
function calculateColumnWidths(headers: string[], rows: string[][]): number[] {
  const widths = headers.map((h) => h.length);

  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      widths[i] = Math.max(widths[i], row[i].length);
    }
  }

  return widths;
}

/**
 * Format data as markdown table with aligned columns
 */
export function formatTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return 'No results';
  }

  const widths = calculateColumnWidths(headers, rows);
  const lines: string[] = [];

  // Header row
  const headerRow = headers.map((h, i) => pad(h, widths[i])).join('  ');
  lines.push(headerRow);

  // Separator row
  const separator = widths.map((w) => '-'.repeat(w)).join('  ');
  lines.push(separator);

  // Data rows
  for (const row of rows) {
    const dataRow = row.map((cell, i) => pad(truncate(cell, 250), widths[i])).join('  ');
    lines.push(dataRow);
  }

  return lines.join('\n');
}

/**
 * Format data as key-value pairs
 */
export function formatKeyValue(pairs: Array<[string, string]>, indent = 0): string {
  const maxKeyLength = Math.max(...pairs.map(([key]) => key.length));
  const indentStr = ' '.repeat(indent);

  return pairs
    .map(([key, value]) => {
      const paddedKey = pad(key + ':', maxKeyLength + 1);
      return `${indentStr}${paddedKey} ${value}`;
    })
    .join('\n');
}

/**
 * Format section with header
 */
export function formatSection(title: string, content: string, level = 2): string {
  const heading = '#'.repeat(level);
  return `${heading} ${title}\n\n${content}`;
}
