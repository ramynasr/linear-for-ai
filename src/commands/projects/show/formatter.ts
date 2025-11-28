import type { LinearProject } from '../../../types/linear.ts';
import { formatProjectDetail as formatMarkdown } from '../../../lib/formatters/projects.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatProjectDetail(
  project: LinearProject,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(project, 'markdown');
  return formatOutput(project, format, markdownOutput);
}
