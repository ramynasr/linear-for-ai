import { assertEquals, assertStringIncludes } from '@std/assert';
import { formatNotificationsList } from '../../../src/lib/formatters/notifications.ts';
import type { LinearNotification, LinearConnection } from '../../../src/types/linear.ts';

const mockNotification: LinearNotification = {
  id: 'notif-1',
  title: 'Test issue assigned to you',
  subtitle: 'Assigned by John Doe',
  type: 'issueAssignedToYou',
  category: 'issue',
  url: 'https://linear.app/team/issue/TEST-123',
  inboxUrl: 'https://linear.app/team/inbox',
  createdAt: '2025-11-20T10:30:00.000Z',
  updatedAt: '2025-11-20T10:30:00.000Z',
};

Deno.test('formatNotificationsList - formats notifications as list', () => {
  const connection: LinearConnection<LinearNotification> = {
    nodes: [mockNotification],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatNotificationsList(connection, 'markdown');
  assertStringIncludes(result, '## Notifications');
  assertStringIncludes(result, 'Assigned by John Doe');
  assertStringIncludes(result, 'Test issue assigned to you');
  assertStringIncludes(result, 'https://linear.app/team/issue/TEST-123');
});

Deno.test('formatNotificationsList - includes separator between items', () => {
  const connection: LinearConnection<LinearNotification> = {
    nodes: [mockNotification, { ...mockNotification, id: 'notif-2' }],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatNotificationsList(connection, 'markdown');
  assertStringIncludes(result, '------');
});

Deno.test('formatNotificationsList - formats as JSON', () => {
  const connection: LinearConnection<LinearNotification> = {
    nodes: [mockNotification],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatNotificationsList(connection, 'json');
  const parsed = JSON.parse(result);
  assertEquals(parsed.data.notifications.nodes[0].title, 'Test issue assigned to you');
  assertEquals(parsed.data.notifications.nodes[0].subtitle, 'Assigned by John Doe');
});

Deno.test('formatNotificationsList - shows empty message when no results', () => {
  const connection: LinearConnection<LinearNotification> = {
    nodes: [],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatNotificationsList(connection, 'markdown');
  assertStringIncludes(result, 'No notifications found');
});

Deno.test('formatNotificationsList - includes pagination message', () => {
  const connection: LinearConnection<LinearNotification> = {
    nodes: [mockNotification],
    pageInfo: { hasNextPage: true, hasPreviousPage: false, endCursor: 'cursor-end' },
  };

  const result = formatNotificationsList(connection, 'markdown');
  assertStringIncludes(result, 'Use --cursor=cursor-end for next page');
});

Deno.test('formatNotificationsList - includes timestamp in output', () => {
  const connection: LinearConnection<LinearNotification> = {
    nodes: [mockNotification],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatNotificationsList(connection, 'markdown');
  // Check that timestamp is formatted (exact format may vary by locale)
  assertStringIncludes(result, '[');
  assertStringIncludes(result, ']');
});
