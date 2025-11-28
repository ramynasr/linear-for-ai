import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { LinearConnection, LinearProject } from '../types/linear.ts';
import type { CommandContext, ListOptions, ShowOptions } from '../types/cli.ts';
import { buildProjectShowQuery, buildProjectsListQuery } from '../lib/queries/projects.ts';
import { formatProjectDetail, formatProjectsList } from '../lib/formatters/projects.ts';

/**
 * List projects command
 */
export async function projectsList(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields['projects list'];
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

  const query = buildProjectsListQuery({
    fields,
    limit,
    cursor: options.cursor,
    filter,
  });

  const response = await client.query<{ projects: LinearConnection<LinearProject> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatProjectsList(response.data.projects, format);
}

/**
 * Show project detail command
 */
export async function projectsShow(
  client: GraphQLClient,
  context: CommandContext,
  id: string,
  options: ShowOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.projects;

  const query = buildProjectShowQuery(id, fields);

  const response = await client.query<{ project: LinearProject }>({
    query,
  });

  if (!response.data?.project) {
    throw new Error(`Project not found: ${id}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatProjectDetail(response.data.project, format);
}
