import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { LinearConnection, LinearTeam } from '../types/linear.ts';
import type { CommandContext, ListOptions, ShowOptions } from '../types/cli.ts';
import { buildTeamsListQuery, buildTeamShowQuery } from '../lib/queries/teams.ts';
import { formatTeamsList, formatTeamDetail } from '../lib/formatters/teams.ts';

/**
 * List teams command
 */
export async function teamsList(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.teams;
  const limit = options.limit || context.config.defaults.limit;

  // Parse filter if provided
  let filter: Record<string, unknown> | undefined;
  if (options.filter) {
    try {
      filter = JSON.parse(options.filter);
    } catch (error) {
      throw new Error(`Invalid filter JSON: ${(error as Error).message}`);
    }
  }

  const query = buildTeamsListQuery({
    fields,
    limit,
    cursor: options.cursor,
    filter,
  });

  const response = await client.query<{ teams: LinearConnection<LinearTeam> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatTeamsList(response.data.teams, format);
}

/**
 * Show team detail command
 */
export async function teamsShow(
  client: GraphQLClient,
  context: CommandContext,
  id: string,
  options: ShowOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.teams;

  const query = buildTeamShowQuery(id, fields);

  const response = await client.query<{ team: LinearTeam }>({
    query,
  });

  if (!response.data?.team) {
    throw new Error(`Team not found: ${id}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatTeamDetail(response.data.team, format);
}
