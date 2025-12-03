import type { LinearConnection } from '../../types/linear.ts';
import type { LinearInitiative } from '../../commands/initiatives/types.ts';
import { formatTable } from './markdown.ts';

/**
 * Field definitions mapping field names to human-readable titles
 * Nested objects indicate complex fields with sub-properties
 */
const FIELD_DEFINITIONS: Record<string, string | Record<string, string>> = {
  id: 'ID',
  name: 'Name',
  slugId: 'Slug ID',
  status: 'Status',
  health: 'Health',
  url: 'URL',
  description: 'Description',
  content: 'Content',
  createdAt: 'Created',
  owner: { displayName: 'Owner', email: 'Owner Email' },
  creator: { displayName: 'Creator', email: 'Creator Email' },
};

/**
 * Get human-readable title for a field
 * Handles both simple fields and nested fields with dot notation (e.g., "owner.displayName")
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
 * Handles both simple fields and nested fields with dot notation (e.g., "owner.displayName")
 */
function formatFieldValue(initiative: LinearInitiative, field: string): string {
  // Handle nested fields with dot notation (supports arbitrary depth)
  if (field.includes('.')) {
    const path = field.split('.');
    const value = path.reduce((obj: any, key: string) => {
      return (obj && obj[key] !== undefined) ? obj[key] : undefined;
    }, initiative);

    if (value === null || value === undefined) {
      return 'N/A';
    }
    return String(value);
  }

  // Handle simple fields
  const value = initiative[field as keyof LinearInitiative];

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
  if (field === 'createdAt' && typeof value === 'string') {
    return new Date(value).toLocaleDateString();
  }

  return String(value);
}

/**
 * Get available fields from the first node
 */
function getAvailableFields(nodes: LinearInitiative[]): string[] {
  if (nodes.length === 0) return [];

  const firstNode = nodes[0];
  const availableFields: string[] = [];

  // Include all fields that exist in the data, regardless of whether they're in FIELD_DEFINITIONS
  for (const field of Object.keys(firstNode)) {
    const value = firstNode[field as keyof LinearInitiative];
    if (value !== undefined && value !== null) {
      availableFields.push(field);
    }
  }

  return availableFields;
}

/**
 * Format initiatives list for output (markdown only)
 */
export function formatInitiativesList(
  connection: LinearConnection<LinearInitiative>,
  fields?: string[],
): string {
  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Initiatives\n\nNo initiatives found.';
  }

  // Use provided fields or auto-detect from data
  const displayFields = fields || getAvailableFields(nodes);
  const headers = displayFields.map((field) => getFieldTitle(field));
  const rows = nodes.map((initiative) =>
    displayFields.map((field) => formatFieldValue(initiative, field))
  );

  const table = formatTable(headers, rows);
  const header = `## Initiatives (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output +=
      `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}
