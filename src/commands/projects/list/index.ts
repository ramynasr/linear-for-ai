import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection, LinearProject } from '../../../types/linear.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatProjectsList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';
import { buildMyResourcesFilter, mergeFilters } from '../../../lib/utils/filters.ts';

export async function list(
  client: GraphQLClient,
  context: CommandContext<ListOptions>,
): Promise<string> {
  const options = context.options;
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields['projects list'],
  );
  const limit = options.limit || context.config.defaults.limit;
  const userFilter = parseFilter(options.filter);

  // Exclude completed projects by default unless --show-completed is provided
  const statusFilter = options.showCompleted
    ? {}
    : { status: { name: { neqIgnoreCase: 'completed' } } };

  // Apply default "my resources" filter unless --fetch-all is provided
  const baseFilter = options.fetchAll
    ? (userFilter || {})
    : mergeFilters(buildMyResourcesFilter('projects'), userFilter);

  // Merge status filter with base filter
  const finalFilter = mergeFilters(baseFilter, statusFilter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter: finalFilter });

  const response = await client.query<{ projects: LinearConnection<LinearProject> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatProjectsList(response.data.projects, format, fields);
}
