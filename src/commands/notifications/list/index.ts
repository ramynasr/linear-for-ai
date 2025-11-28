import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection, LinearNotification } from '../../../types/linear.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatNotificationsList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';

export async function list(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.notifications,
  );
  const limit = options.limit || context.config.defaults.limit;
  const filter = parseFilter(options.filter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter });

  const response = await client.query<{ notifications: LinearConnection<LinearNotification> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatNotificationsList(response.data.notifications, format);
}
