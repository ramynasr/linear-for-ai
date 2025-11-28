import type { LinearConnection, LinearIssue } from '../../types/linear.ts';
import { formatKeyValue, formatSection, formatTable } from './markdown.ts';

/**
 * Field definitions mapping field names to human-readable titles
 * Nested objects indicate complex fields with sub-properties
 */
const FIELD_DEFINITIONS: Record<string, string | Record<string, string>> = {
  id: 'ID',
  identifier: 'ID',
  title: 'Title',
  description: 'Description',
  priority: 'Priority',
  priorityLabel: 'Priority',
  createdAt: 'Created',
  updatedAt: 'Updated',
  url: 'URL',
  state: { name: 'Status' },
  assignee: { displayName: 'Assignee', email: 'Assignee Email' },
  creator: { displayName: 'Creator', email: 'Creator Email' },
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
function formatFieldValue(issue: LinearIssue, field: string): string {
  const value = issue[field as keyof LinearIssue];

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle nested fields
  const definition = FIELD_DEFINITIONS[field];
  if (typeof definition === 'object' && typeof value === 'object' && value !== null) {
    const nestedField = Object.keys(definition)[0];
    return (value as any)[nestedField] || 'N/A';
  }

  // Handle dates
  if ((field === 'createdAt' || field === 'updatedAt') && typeof value === 'string') {
    return new Date(value).toLocaleDateString();
  }

  return String(value);
}

/**
 * Get available fields from the first node
 */
function getAvailableFields(nodes: LinearIssue[]): string[] {
  if (nodes.length === 0) return [];

  const firstNode = nodes[0];
  const availableFields: string[] = [];

  // Include all fields that exist in the data, regardless of whether they're in FIELD_DEFINITIONS
  for (const field of Object.keys(firstNode)) {
    const value = firstNode[field as keyof LinearIssue];
    if (value !== undefined && value !== null) {
      availableFields.push(field);
    }
  }

  return availableFields;
}

/**
 * Format issues list for output (markdown only)
 */
export function formatIssuesList(
  connection: LinearConnection<LinearIssue>,
): string {
  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Issues\n\nNo issues found.';
  }

  // Determine which fields are present in the data
  const fields = getAvailableFields(nodes);
  const headers = fields.map((field) => getFieldTitle(field));
  const rows = nodes.map((issue) => fields.map((field) => formatFieldValue(issue, field)));

  const table = formatTable(headers, rows);
  const header = `## Issues (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output +=
      `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}

/**
 * Format single issue detail for output (markdown only)
 */
export function formatIssueDetail(issue: LinearIssue): string {
  const pairs: Array<[string, string]> = [
    ['Status', issue.state.name],
    ['Priority', issue.priorityLabel],
    ['Created', new Date(issue.createdAt).toLocaleDateString()],
    ['Updated', new Date(issue.updatedAt).toLocaleDateString()],
    ['URL', issue.url],
  ];

  if (issue.assignee) {
    pairs.splice(2, 0, ['Assignee', `@${issue.assignee.displayName}`]);
  }

  const metadata = formatKeyValue(pairs);
  const header = `## ${issue.identifier}: ${issue.title}`;
  let output = `${header}\n\n${metadata}`;

  if (issue.description) {
    output += '\n\n' + formatSection('Description', issue.description, 3);
  }

  return output;
}
