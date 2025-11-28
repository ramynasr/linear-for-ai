import type { LinearConnection, LinearTeam } from '../../../types/linear.ts';
import { formatTeamsList as formatMarkdown } from '../../../lib/formatters/teams.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatTeamsList(
  connection: LinearConnection<LinearTeam>,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(connection, 'markdown');
  return formatOutput(connection, format, markdownOutput);
}
