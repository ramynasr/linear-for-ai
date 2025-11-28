import type { LinearConnection, LinearNotification } from '../../types/linear.ts';

/**
 * Format a date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

/**
 * Format notifications list for output
 */
export function formatNotificationsList(
  connection: LinearConnection<LinearNotification>,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify(
      {
        data: {
          notifications: connection,
        },
      },
      null,
      2,
    );
  }

  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Notifications\n\nNo notifications found.';
  }

  const header = `## Notifications (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;
  const items: string[] = [];

  for (const notification of nodes) {
    const timestamp = formatDate(notification.createdAt);
    const item = [
      `[${timestamp}] ${notification.subtitle}`,
      '',
      notification.title,
      notification.url,
    ].join('\n');
    items.push(item);
  }

  const separator = '-'.repeat(80);
  const notificationsList = items.join(`\n\n${separator}\n\n`);

  let output = `${header}\n\n${notificationsList}`;

  if (pageInfo.hasNextPage) {
    output +=
      `\n\n${separator}\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}
