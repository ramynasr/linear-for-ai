import type { LinearIssue } from '../../../types/linear.ts';
import { formatIssueDetail as formatMarkdown } from '../../../lib/formatters/issues.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

/**
 * Format issue detail for output
 */
export function formatIssueDetail(
  issue: LinearIssue,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(issue);
  return formatOutput(issue, format, markdownOutput);
}
