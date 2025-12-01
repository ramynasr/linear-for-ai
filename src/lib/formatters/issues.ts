import type { LinearConnection, LinearIssue } from '../../types/linear.ts';
import { formatKeyValue, formatSection, formatTable } from './markdown.ts';

/**
 * Field definitions mapping field names to human-readable titles
 * Nested objects indicate complex fields with sub-properties
 */
const FIELD_DEFINITIONS: Record<string, string | Record<string, string>> = {
  id: 'ID',
  identifier: 'ID',
  number: 'Number',
  title: 'Title',
  description: 'Description',
  priority: 'Priority',
  priorityLabel: 'Priority',
  estimate: 'Estimate',
  dueDate: 'Due Date',
  branchName: 'Branch Name',
  createdAt: 'Created',
  updatedAt: 'Updated',
  startedAt: 'Started At',
  completedAt: 'Completed At',
  canceledAt: 'Canceled At',
  archivedAt: 'Archived',
  snoozedUntilAt: 'Snoozed Until',
  trashed: 'Trashed',
  url: 'URL',
  state: { name: 'Status', color: 'Status Color', description: 'Status Description', type: 'Status Type' },
  assignee: { displayName: 'Assignee', name: 'Assignee Name', email: 'Assignee Email' },
  creator: { displayName: 'Creator', name: 'Creator Name', email: 'Creator Email' },
  team: { key: 'Team', name: 'Team Name', displayName: 'Team Full Name', color: 'Team Color' },
  cycle: { number: 'Cycle', name: 'Cycle Name' },
  project: { name: 'Project', slugId: 'Project Slug' },
  parent: { identifier: 'Parent', title: 'Parent Title' },
};

/**
 * Get human-readable title for a field
 * Handles both simple fields and nested fields with dot notation (e.g., "team.key")
 */
function getFieldTitle(field: string): string {
  // Handle nested fields with dot notation
  if (field.includes('.')) {
    const [parent, child] = field.split('.');
    const parentDef = FIELD_DEFINITIONS[parent];

    if (parentDef && typeof parentDef === 'object' && parentDef[child]) {
      return parentDef[child];
    }

    // If not in definitions, use child name as title
    return child;
  }

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
 * Handles both simple fields and nested fields with dot notation (e.g., "team.key")
 */
function formatFieldValue(issue: LinearIssue, field: string): string {
  // Handle nested fields with dot notation
  if (field.includes('.')) {
    const [parent, child] = field.split('.');
    const parentValue = issue[parent as keyof LinearIssue];

    if (parentValue === null || parentValue === undefined) {
      return 'N/A';
    }

    if (typeof parentValue === 'object' && parentValue !== null) {
      const childValue = (parentValue as any)[child];
      return childValue !== null && childValue !== undefined ? String(childValue) : 'N/A';
    }

    return 'N/A';
  }

  // Handle simple fields
  const value = issue[field as keyof LinearIssue];

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle nested fields defined in FIELD_DEFINITIONS (backward compatibility)
  const definition = FIELD_DEFINITIONS[field];
  if (typeof definition === 'object' && typeof value === 'object' && value !== null) {
    const nestedField = Object.keys(definition)[0];
    return (value as any)[nestedField] || 'N/A';
  }

  // Handle dates
  if (
    (field === 'createdAt' || field === 'updatedAt' || field === 'startedAt' ||
      field === 'completedAt' || field === 'canceledAt' || field === 'archivedAt' ||
      field === 'snoozedUntilAt' || field === 'dueDate') && typeof value === 'string'
  ) {
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
  fields?: string[],
): string {
  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Issues\n\nNo issues found.';
  }

  // Use provided fields or auto-detect from data
  const displayFields = fields || getAvailableFields(nodes);
  const headers = displayFields.map((field) => getFieldTitle(field));
  const rows = nodes.map((issue) =>
    displayFields.map((field) => formatFieldValue(issue, field))
  );

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
