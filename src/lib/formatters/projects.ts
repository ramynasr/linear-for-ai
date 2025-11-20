import type { LinearProject, LinearConnection } from '../../types/linear.ts';
import { formatTable, formatKeyValue, formatSection } from './markdown.ts';

/**
 * Field definitions mapping field names to human-readable titles
 */
const FIELD_DEFINITIONS: Record<string, string> = {
  id: 'ID',
  name: 'Name',
  state: 'State',
  progress: 'Progress',
  startDate: 'Start Date',
  targetDate: 'Target Date',
  createdAt: 'Created',
  updatedAt: 'Updated',
  url: 'URL',
};

/**
 * Format a field value for display
 */
function formatFieldValue(project: LinearProject, field: string): string {
  const value = project[field as keyof LinearProject];

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Special formatting for specific fields
  if (field === 'progress' && typeof value === 'number') {
    return `${value}%`;
  }

  if ((field === 'startDate' || field === 'targetDate' || field === 'createdAt' || field === 'updatedAt') && typeof value === 'string') {
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

  for (const field of Object.keys(FIELD_DEFINITIONS)) {
    if (field in firstNode && firstNode[field as keyof LinearProject] !== undefined) {
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
    return JSON.stringify({
      data: {
        projects: connection,
      },
    }, null, 2);
  }

  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Projects\n\nNo projects found.';
  }

  // Determine which fields are present in the data
  const fields = getAvailableFields(nodes);
  const headers = fields.map((field) => FIELD_DEFINITIONS[field]);
  const rows = nodes.map((project) =>
    fields.map((field) => formatFieldValue(project, field))
  );

  const table = formatTable(headers, rows);
  const header = `## Projects (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output += `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}

/**
 * Format single project detail for output
 */
export function formatProjectDetail(project: LinearProject, format: 'markdown' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        project,
      },
    }, null, 2);
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
