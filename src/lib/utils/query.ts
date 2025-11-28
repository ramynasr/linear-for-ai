/**
 * Shared utilities for building GraphQL queries
 */

import { toGraphQLSyntax } from '../graphql-syntax.ts';

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
 * Convert filter object to GraphQL input syntax.
 * Returns empty string if filter is undefined or null.
 * toGraphQLSyntax is a pure synchronous function with no dependencies,
 * so this function is synchronous to avoid unnecessary async overhead.
 */
export function buildFilterClause(
  filter?: Record<string, unknown>,
): string {
  if (!filter) return '';
  return `, filter: ${toGraphQLSyntax(filter)}`;
}
