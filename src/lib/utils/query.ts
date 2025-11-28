/**
 * Shared utilities for building GraphQL queries
 */

/**
 * Format fields array as newline-separated string with indentation
 */
export function buildFieldSelection(fields: string[]): string {
  return fields.join('\n    ');
}

/**
 * Build pagination parameters object
 */
export function buildPaginationParams(
  limit: number,
  cursor?: string,
): Record<string, unknown> {
  const params: Record<string, unknown> = { first: limit };
  if (cursor) {
    params.after = cursor;
  }
  return params;
}

/**
 * Convert filter object to GraphQL input syntax
 */
export async function buildFilterClause(
  filter?: Record<string, unknown>,
): Promise<string> {
  if (!filter) return '';

  const { toGraphQLSyntax } = await import('../graphql-syntax.ts');
  return `, filter: ${toGraphQLSyntax(filter)}`;
}
