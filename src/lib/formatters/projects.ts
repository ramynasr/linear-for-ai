import type { LinearProject, LinearConnection } from '../../types/linear.ts';
import { formatTable, formatKeyValue, formatSection } from './markdown.ts';

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

  const headers = ['Name', 'State', 'Progress', 'Target Date', 'URL'];
  const rows = nodes.map((project) => [
    project.name || '',
    project.state || 'N/A',
    project.progress !== undefined ? `${project.progress}%` : 'N/A',
    project.targetDate || 'N/A',
    project.url || '',
  ]);

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
