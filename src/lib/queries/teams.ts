import { toGraphQLSyntax } from '../graphql-syntax.ts';

export interface TeamsListOptions {
  fields?: string[];
  limit?: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

/**
 * Build GraphQL query for listing teams
 */
export function buildTeamsListQuery(options: TeamsListOptions): string {
  const fields = options.fields || [
    'id',
    'key',
    'name',
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
      teams${argsStr} {
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
 * Build GraphQL query for showing a single team
 */
export function buildTeamShowQuery(id: string, fields?: string[]): string {
  const fieldList = fields || [
    'id',
    'key',
    'name',
    'description',
    'url',
  ];

  return `
    query {
      team(id: "${id}") {
        ${buildFieldsString(fieldList)}
      }
    }
  `;
}

/**
 * Build nested field string with relations
 */
function buildFieldsString(fields: string[]): string {
  const simpleFields: string[] = [];
  const nestedFields: Record<string, string[]> = {};

  for (const field of fields) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!nestedFields[parent]) {
        nestedFields[parent] = [];
      }
      nestedFields[parent].push(child);
    } else {
      simpleFields.push(field);
    }
  }

  const result = [...simpleFields];

  for (const [parent, children] of Object.entries(nestedFields)) {
    result.push(`${parent} { ${children.join(' ')} }`);
  }

  return result.join('\n          ');
}
