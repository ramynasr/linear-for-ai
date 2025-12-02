import { buildFieldsString, buildFilterClause } from '../../../lib/utils/query.ts';

export interface BuildQueryOptions {
  fields: string[];
  limit: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

/**
 * Build GraphQL query for listing initiatives
 */
export function buildQuery(options: BuildQueryOptions): string {
  const { fields, limit, cursor, filter } = options;

  const paginationArgs: string[] = [];
  paginationArgs.push(`first: ${limit}`);
  if (cursor) {
    paginationArgs.push(`after: "${cursor}"`);
  }

  const filterClause = buildFilterClause(filter);
  const paginationStr = paginationArgs.join(', ');

  return `
    query {
      initiatives(${paginationStr}${filterClause}) {
        nodes {
          ${buildFieldsString(fields)}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}
