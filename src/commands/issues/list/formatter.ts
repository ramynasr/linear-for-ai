import type { LinearConnection, LinearIssue } from '../../../types/linear.ts';
import { formatIssuesList as formatMarkdown } from '../../../lib/formatters/issues.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

/**
 * Format issues list for output
 */
export function formatIssuesList(
  connection: LinearConnection<LinearIssue>,
  format: 'markdown' | 'json',
  fields?: string[],
): string {
  const markdownOutput = formatMarkdown(connection, fields);
  return formatOutput(connection, format, markdownOutput);
}
