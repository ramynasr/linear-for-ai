/**
 * Shared utilities for formatting output
 */

/**
 * Format output based on requested format
 */
export function formatOutput(
  data: unknown,
  format: 'markdown' | 'json',
  markdownOutput: string,
): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  return markdownOutput;
}

/**
 * Format empty result message
 */
export function formatEmptyResult(resourceName: string): string {
  return `No ${resourceName} found.`;
}

/**
 * Format pagination info
 */
export function formatPaginationInfo(
  hasNextPage: boolean,
  endCursor?: string,
): string {
  if (!hasNextPage) return '';

  return `\n\nTo see more results, use: --cursor "${endCursor}"`;
}
