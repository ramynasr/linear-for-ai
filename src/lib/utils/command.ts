/**
 * Shared utilities for command implementations
 */

/**
 * Parse filter JSON string
 */
export function parseFilter(
  filterString?: string,
): Record<string, unknown> | undefined {
  if (!filterString) return undefined;

  try {
    return JSON.parse(filterString);
  } catch (error) {
    throw new Error(`Invalid filter JSON: ${(error as Error).message}`);
  }
}

/**
 * Get fields from string or use defaults
 */
export function getFieldsOrDefault(
  fieldsString: string | undefined,
  defaultFields: string[],
): string[] {
  if (!fieldsString) return defaultFields;
  return fieldsString.split(',');
}
