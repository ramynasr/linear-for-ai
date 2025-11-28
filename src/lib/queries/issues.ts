import { buildFieldsString, toGraphQLSyntax } from '../graphql-syntax.ts';

export interface IssuesListOptions {
  fields?: string[];
  limit?: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

/**
 * Build GraphQL query for listing issues
 */
export function buildIssuesListQuery(options: IssuesListOptions): string {
  const fields = options.fields || [
    'id',
    'identifier',
    'title',
    'url',
  ];

  const paginationArgs: string[] = [];
  if (options.limit) {
    paginationArgs.push(`first: ${options.limit}`);
  }
  if (options.cursor) {
    paginationArgs.push(`after: "${options.cursor}"`);
  }

  const filterArg = options.filter ? `, filter: ${toGraphQLSyntax(options.filter)}` : '';
  const paginationStr = paginationArgs.length > 0 ? paginationArgs.join(', ') : '';

  // Only include parentheses if there are arguments
  const argsStr = paginationStr || filterArg ? `(${paginationStr}${filterArg})` : '';

  return `
    query {
      issues${argsStr} {
        nodes {
          ${buildFieldsString(fields)}
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;
}

/**
 * Build GraphQL query for showing a single issue
 */
export function buildIssueShowQuery(identifier: string, fields?: string[]): string {
  const fieldList = fields || [
    'id',
    'identifier',
    'title',
    'description',
    'priority',
    'priorityLabel',
    'createdAt',
    'updatedAt',
    'url',
  ];

  return `
    query {
      issue(id: "${identifier}") {
        ${buildFieldsString(fieldList)}
      }
    }
  `;
}
