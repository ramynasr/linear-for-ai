import { buildFieldsString, toGraphQLSyntax } from '../../../lib/graphql-syntax.ts';

export interface BuildQueryOptions {
  fields: string[];
  limit: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

/**
 * Build GraphQL query for listing issues
 */
export function buildQuery(options: BuildQueryOptions): string {
  const { fields, limit, cursor, filter } = options;

  const paginationArgs: string[] = [];
  paginationArgs.push(`first: ${limit}`);
  if (cursor) {
    paginationArgs.push(`after: "${cursor}"`);
  }

  const filterArg = filter ? `, filter: ${toGraphQLSyntax(filter)}` : '';
  const paginationStr = paginationArgs.join(', ');

  return `
    query {
      issues(${paginationStr}${filterArg}) {
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
