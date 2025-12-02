import type { LinearConnection } from '../../../types/linear.ts';
import type { LinearInitiative } from '../types.ts';
import { formatInitiativesList as formatMarkdown } from '../../../lib/formatters/initiatives.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

/**
 * Format initiatives list for output
 */
export function formatInitiativesList(
  connection: LinearConnection<LinearInitiative>,
  format: 'markdown' | 'json',
  fields?: string[],
): string {
  const markdownOutput = formatMarkdown(connection, fields);
  return formatOutput(connection, format, markdownOutput);
}
