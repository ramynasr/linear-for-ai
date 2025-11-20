import type { LinearIssue, LinearConnection } from '../../types/linear.ts';
import { formatTable, formatKeyValue, formatSection } from './markdown.ts';

/**
 * Format issues list for output
 */
export function formatIssuesList(
  connection: LinearConnection<LinearIssue>,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        issues: connection,
      },
    }, null, 2);
  }

  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Issues\n\nNo issues found.';
  }

  const headers = ['ID', 'Title', 'Status', 'Priority', 'URL'];
  const rows = nodes.map((issue) => [
    issue.identifier,
    issue.title,
    issue.state.name,
    issue.priorityLabel,
    issue.url,
  ]);

  const table = formatTable(headers, rows);
  const header = `## Issues (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output += `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}

/**
 * Format single issue detail for output
 */
export function formatIssueDetail(issue: LinearIssue, format: 'markdown' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        issue,
      },
    }, null, 2);
  }

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
