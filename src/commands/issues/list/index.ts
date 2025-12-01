import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection, LinearIssue } from '../../../types/linear.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatIssuesList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';
import { buildMyResourcesFilter, mergeFilters } from '../../../lib/utils/filters.ts';

/**
 * List issues command
 */
export async function list(
  client: GraphQLClient,
  context: CommandContext<ListOptions>,
): Promise<string> {
  const options = context.options;
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.issues,
  );
  const limit = options.limit || context.config.defaults.limit;
  const userFilter = parseFilter(options.filter);

  // Apply default "my resources" filter unless --fetch-all is provided
  const finalFilter = options.fetchAll
    ? userFilter
    : mergeFilters(buildMyResourcesFilter('issues'), userFilter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter: finalFilter });

  const response = await client.query<{ issues: LinearConnection<LinearIssue> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatIssuesList(response.data.issues, format, fields);
}
