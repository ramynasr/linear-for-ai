import type { LinearConnection, LinearProject } from '../../types/linear.ts';
import { formatKeyValue, formatSection, formatTable } from './markdown.ts';

/**
 * Field definitions mapping field names to human-readable titles
 * Nested objects indicate complex fields with sub-properties
 */
const FIELD_DEFINITIONS: Record<string, string | Record<string, string>> = {
  id: 'ID',
  name: 'Name',
  state: 'State',
  progress: 'Progress',
  startDate: 'Start Date',
  targetDate: 'Target Date',
  createdAt: 'Created',
  updatedAt: 'Updated',
  url: 'URL',
  lead: { displayName: 'Lead' },
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
function formatFieldValue(project: LinearProject, field: string): string {
  const value = project[field as keyof LinearProject];

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle nested fields
  const definition = FIELD_DEFINITIONS[field];
  if (typeof definition === 'object' && typeof value === 'object' && value !== null) {
    const nestedField = Object.keys(definition)[0];
    return (value as any)[nestedField] || 'N/A';
  }

  // Special formatting for specific fields
  if (field === 'progress' && typeof value === 'number') {
    return `${value}%`;
  }

  if (
    (field === 'startDate' || field === 'targetDate' || field === 'createdAt' ||
      field === 'updatedAt') && typeof value === 'string'
  ) {
    return new Date(value).toLocaleDateString();
  }

  return String(value);
}

/**
 * Get available fields from the first node
 */
function getAvailableFields(nodes: LinearProject[]): string[] {
  if (nodes.length === 0) return [];

  const firstNode = nodes[0];
  const availableFields: string[] = [];

  // Include all fields that exist in the data, regardless of whether they're in FIELD_DEFINITIONS
  for (const field of Object.keys(firstNode)) {
    const value = firstNode[field as keyof LinearProject];
    if (value !== undefined && value !== null) {
      availableFields.push(field);
    }
  }

  return availableFields;
}

/**
 * Format projects list for output
 */
export function formatProjectsList(
  connection: LinearConnection<LinearProject>,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify(
      {
        data: {
          projects: connection,
        },
      },
      null,
      2,
    );
  }

  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Projects\n\nNo projects found.';
  }

  // Determine which fields are present in the data
  const fields = getAvailableFields(nodes);
  const headers = fields.map((field) => getFieldTitle(field));
  const rows = nodes.map((project) => fields.map((field) => formatFieldValue(project, field)));

  const table = formatTable(headers, rows);
  const header = `## Projects (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output +=
      `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}

/**
 * Format single project detail for output
 */
export function formatProjectDetail(project: LinearProject, format: 'markdown' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify(
      {
        data: {
          project,
        },
      },
      null,
      2,
    );
  }

  const pairs: Array<[string, string]> = [
    ['State', project.state],
    ['Progress', `${project.progress}%`],
  ];

  if (project.lead) {
    pairs.push(['Lead', `@${project.lead.displayName}`]);
  }

  if (project.startDate) {
    pairs.push(['Start Date', new Date(project.startDate).toLocaleDateString()]);
  }

  if (project.targetDate) {
    pairs.push(['Target Date', new Date(project.targetDate).toLocaleDateString()]);
  }

  pairs.push(['URL', project.url]);

  const metadata = formatKeyValue(pairs);
  const header = `## ${project.name}`;
  let output = `${header}\n\n${metadata}`;

  if (project.description) {
    output += '\n\n' + formatSection('Description', project.description, 3);
  }

  return output;
}
