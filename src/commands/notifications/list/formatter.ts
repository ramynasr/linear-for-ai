import type { LinearConnection, LinearNotification } from '../../../types/linear.ts';
import { formatNotificationsList as formatMarkdown } from '../../../lib/formatters/notifications.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatNotificationsList(
  connection: LinearConnection<LinearNotification>,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(connection, 'markdown');
  return formatOutput(connection, format, markdownOutput);
}
