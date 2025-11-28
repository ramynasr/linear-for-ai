import {
  buildFieldsString,
  buildFilterClause,
  buildPaginationParams,
} from '../../../lib/utils/query.ts';

export interface BuildQueryOptions {
  fields: string[];
  limit: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

export function buildQuery(options: BuildQueryOptions): string {
  const { fields, limit, cursor, filter } = options;
  const params = buildPaginationParams(limit, cursor);
  const filterClause = buildFilterClause(filter);

  return `
    query {
      notifications(first: ${params.first}${
    cursor ? `, after: "${params.after}"` : ''
  }${filterClause}) {
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
