import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection } from '../../../types/linear.ts';
import type { LinearInitiative } from '../types.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatInitiativesList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';
import { buildMyResourcesFilter, mergeFilters } from '../../../lib/utils/filters.ts';

/**
 * List initiatives command
 */
export async function list(
  client: GraphQLClient,
  context: CommandContext<ListOptions>,
): Promise<string> {
  const options = context.options;
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.initiatives || ['id', 'name', 'status', 'slugId', 'url'],
  );
  const limit = options.limit || context.config.defaults.limit;
  const userFilter = parseFilter(options.filter);

  // Apply default "my resources" filter unless --fetch-all is provided
  const finalFilter = options.fetchAll
    ? userFilter
    : mergeFilters(buildMyResourcesFilter('initiatives'), userFilter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter: finalFilter });

  const response = await client.query<{ initiatives: LinearConnection<LinearInitiative> }>({
    query,
  });

  if (!response.data) {
    const filterDesc = finalFilter ? ` with filter: ${JSON.stringify(finalFilter)}` : '';
    throw new Error(`No initiatives data returned from API${filterDesc}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatInitiativesList(response.data.initiatives, format, fields);
}
