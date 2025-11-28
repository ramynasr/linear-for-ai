import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection, LinearTeam } from '../../../types/linear.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatTeamsList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';

export async function list(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.teams,
  );
  const limit = options.limit || context.config.defaults.limit;
  const filter = parseFilter(options.filter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter });

  const response = await client.query<{ teams: LinearConnection<LinearTeam> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatTeamsList(response.data.teams, format);
}
