import type { LinearTeam, LinearConnection } from '../../types/linear.ts';
import { formatTable, formatKeyValue, formatSection } from './markdown.ts';

/**
 * Format teams list for output
 */
export function formatTeamsList(
  connection: LinearConnection<LinearTeam>,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        teams: connection,
      },
    }, null, 2);
  }

  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Teams\n\nNo teams found.';
  }

  const headers = ['Key', 'Name', 'URL'];
  const rows = nodes.map((team) => [
    team.key,
    team.name,
    team.url,
  ]);

  const table = formatTable(headers, rows);
  const header = `## Teams (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output += `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}

/**
 * Format single team detail for output
 */
export function formatTeamDetail(team: LinearTeam, format: 'markdown' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        team,
      },
    }, null, 2);
  }

  const pairs: Array<[string, string]> = [
    ['Key', team.key],
    ['URL', team.url],
  ];

  const metadata = formatKeyValue(pairs);
  const header = `## ${team.name} (${team.key})`;
  let output = `${header}\n\n${metadata}`;

  if (team.description) {
    output += '\n\n' + formatSection('Description', team.description, 3);
  }

  return output;
}
