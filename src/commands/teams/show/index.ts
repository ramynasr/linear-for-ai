import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearTeam } from '../../../types/linear.ts';
import type { CommandContext, ShowOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatTeamDetail } from './formatter.ts';
import { getFieldsOrDefault } from '../../../lib/utils/command.ts';

export async function show(
  client: GraphQLClient,
  context: CommandContext,
  id: string,
  options: ShowOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.teams,
  );

  const query = buildQuery(id, fields);

  const response = await client.query<{ team: LinearTeam }>({ query });

  if (!response.data?.team) {
    throw new Error(`Team not found: ${id}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatTeamDetail(response.data.team, format);
}
