import type { LinearConnection, LinearProject } from '../../../types/linear.ts';
import { formatProjectsList as formatMarkdown } from '../../../lib/formatters/projects.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatProjectsList(
  connection: LinearConnection<LinearProject>,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(connection, 'markdown');
  return formatOutput(connection, format, markdownOutput);
}
