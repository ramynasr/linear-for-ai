import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { LinearConnection, LinearNotification } from '../types/linear.ts';
import type { CommandContext, ListOptions } from '../types/cli.ts';
import { buildNotificationsListQuery } from '../lib/queries/notifications.ts';
import { formatNotificationsList } from '../lib/formatters/notifications.ts';

/**
 * List notifications command
 */
export async function notificationsList(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.notifications;
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

  const query = buildNotificationsListQuery({
    fields,
    limit,
    cursor: options.cursor,
    filter,
  });

  const response = await client.query<{ notifications: LinearConnection<LinearNotification> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatNotificationsList(response.data.notifications, format);
}
