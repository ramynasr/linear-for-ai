import type { LinearTeam, LinearConnection } from '../../types/linear.ts';
import { formatTable, formatKeyValue, formatSection } from './markdown.ts';

/**
 * Field definitions mapping field names to human-readable titles
 * Nested objects indicate complex fields with sub-properties
 */
const FIELD_DEFINITIONS: Record<string, string | Record<string, string>> = {
  id: 'ID',
  key: 'Key',
  name: 'Name',
  description: 'Description',
  url: 'URL',
};

/**
 * Get human-readable title for a field
 */
function getFieldTitle(field: string): string {
  const definition = FIELD_DEFINITIONS[field];

  if (!definition) {
    // Unknown field - use field name as title
    return field;
  }

  if (typeof definition === 'object') {
    // Nested field - use the first nested property's title
    const nestedField = Object.keys(definition)[0];
    return definition[nestedField];
  }

  return definition;
}

/**
 * Format a field value for display
 */
function formatFieldValue(team: LinearTeam, field: string): string {
  const value = team[field as keyof LinearTeam];

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle nested fields
  const definition = FIELD_DEFINITIONS[field];
  if (typeof definition === 'object' && typeof value === 'object' && value !== null) {
    const nestedField = Object.keys(definition)[0];
    return (value as any)[nestedField] || 'N/A';
  }

  return String(value);
}

/**
 * Get available fields from the first node
 */
function getAvailableFields(nodes: LinearTeam[]): string[] {
  if (nodes.length === 0) return [];

  const firstNode = nodes[0];
  const availableFields: string[] = [];

  // Include all fields that exist in the data, regardless of whether they're in FIELD_DEFINITIONS
  for (const field of Object.keys(firstNode)) {
    const value = firstNode[field as keyof LinearTeam];
    if (value !== undefined && value !== null) {
      availableFields.push(field);
    }
  }

  return availableFields;
}

/**
 * Format teams list for output
 */
export function formatTeamsList(
  connection: LinearConnection<LinearTeam>,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        teams: connection,
      },
    }, null, 2);
  }

  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Teams\n\nNo teams found.';
  }

  // Determine which fields are present in the data
  const fields = getAvailableFields(nodes);
  const headers = fields.map((field) => getFieldTitle(field));
  const rows = nodes.map((team) =>
    fields.map((field) => formatFieldValue(team, field))
  );

  const table = formatTable(headers, rows);
  const header = `## Teams (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output += `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}

/**
 * Format single team detail for output
 */
export function formatTeamDetail(team: LinearTeam, format: 'markdown' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        team,
      },
    }, null, 2);
  }

  const pairs: Array<[string, string]> = [
    ['Key', team.key],
    ['URL', team.url],
  ];

  const metadata = formatKeyValue(pairs);
  const header = `## ${team.name} (${team.key})`;
  let output = `${header}\n\n${metadata}`;

  if (team.description) {
    output += '\n\n' + formatSection('Description', team.description, 3);
  }

  return output;
}
