import type { LinearTeam } from '../../../types/linear.ts';
import { formatTeamDetail as formatMarkdown } from '../../../lib/formatters/teams.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatTeamDetail(
  team: LinearTeam,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(team, 'markdown');
  return formatOutput(team, format, markdownOutput);
}
