import type { LinearConnection, LinearProject } from '../../types/linear.ts';
import { formatKeyValue, formatSection, formatTable } from './markdown.ts';

/**
 * Field definitions mapping field names to human-readable titles
 * Nested objects indicate complex fields with sub-properties
 */
const FIELD_DEFINITIONS: Record<string, string | Record<string, string>> = {
  id: 'ID',
  name: 'Name',
  slugId: 'Slug',
  state: 'State',
  status: { name: 'Status', type: 'Status Type', color: 'Status Color', description: 'Status Description' },
  progress: 'Progress',
  priority: 'Priority',
  priorityLabel: 'Priority',
  health: 'Health',
  scope: 'Scope',
  color: 'Color',
  icon: 'Icon',
  startDate: 'Start Date',
  targetDate: 'Target Date',
  startedAt: 'Started At',
  completedAt: 'Completed At',
  canceledAt: 'Canceled At',
  createdAt: 'Created',
  updatedAt: 'Updated',
  archivedAt: 'Archived',
  trashed: 'Trashed',
  url: 'URL',
  lead: { displayName: 'Lead', name: 'Lead Name', email: 'Lead Email' },
  creator: { displayName: 'Creator', name: 'Creator Name', email: 'Creator Email' },
};

/**
 * Get human-readable title for a field
 * Handles both simple fields and nested fields with dot notation (e.g., "status.name")
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
 * Handles both simple fields and nested fields with dot notation (e.g., "status.name")
 */
function formatFieldValue(project: LinearProject, field: string): string {
  // Handle nested fields with dot notation
  if (field.includes('.')) {
    const [parent, child] = field.split('.');
    const parentValue = project[parent as keyof LinearProject];

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
  const value = project[field as keyof LinearProject];

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle nested fields defined in FIELD_DEFINITIONS (backward compatibility)
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
  fields?: string[],
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

  // Use provided fields or auto-detect from data
  const displayFields = fields || getAvailableFields(nodes);
  const headers = displayFields.map((field) => getFieldTitle(field));
  const rows = nodes.map((project) =>
    displayFields.map((field) => formatFieldValue(project, field))
  );

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
