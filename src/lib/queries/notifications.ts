import { buildFieldsString, toGraphQLSyntax } from '../graphql-syntax.ts';

export interface NotificationsListOptions {
  fields?: string[];
  limit?: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

/**
 * Build GraphQL query for listing notifications
 */
export function buildNotificationsListQuery(options: NotificationsListOptions): string {
  const fields = options.fields || [
    'id',
    'title',
    'subtitle',
    'url',
    'createdAt',
  ];

  // Always ensure createdAt is included (required for formatting)
  if (!fields.includes('createdAt')) {
    fields.push('createdAt');
  }

  const paginationArgs: string[] = [];
  if (options.limit) {
    paginationArgs.push(`first: ${options.limit}`);
  }

  if (options.cursor) {
    paginationArgs.push(`after: "${options.cursor}"`);
  }

  // Default filter: notifications from last 30 days
  let filter = options.filter;
  if (!filter) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filter = {
      createdAt: {
        gte: thirtyDaysAgo.toISOString(),
      },
    };
  }

  const filterArg = filter ? `, filter: ${toGraphQLSyntax(filter)}` : '';
  const paginationStr = paginationArgs.length > 0 ? paginationArgs.join(', ') : '';

  // Only include parentheses if there are arguments
  const argsStr = paginationStr || filterArg ? `(${paginationStr}${filterArg})` : '';

  return `
    query {
      notifications${argsStr} {
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
