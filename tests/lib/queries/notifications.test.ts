import { assertStringIncludes } from '@std/assert';
import { buildNotificationsListQuery } from '../../../src/lib/queries/notifications.ts';

Deno.test('buildNotificationsListQuery - generates basic query', () => {
  const query = buildNotificationsListQuery({});
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'notifications');
  assertStringIncludes(query, 'nodes');
  assertStringIncludes(query, 'pageInfo');
});

Deno.test('buildNotificationsListQuery - includes requested fields', () => {
  const query = buildNotificationsListQuery({
    fields: ['id', 'title', 'subtitle', 'url'],
  });
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'title');
  assertStringIncludes(query, 'subtitle');
  assertStringIncludes(query, 'url');
});

Deno.test('buildNotificationsListQuery - includes pagination parameters', () => {
  const query = buildNotificationsListQuery({ limit: 25, cursor: 'abc123' });
  assertStringIncludes(query, 'first: 25');
  assertStringIncludes(query, 'after: "abc123"');
});

Deno.test('buildNotificationsListQuery - includes default 30-day filter', () => {
  const query = buildNotificationsListQuery({});
  // Should include a createdAt filter with gte
  assertStringIncludes(query, 'createdAt');
  assertStringIncludes(query, 'gte:');
});

Deno.test('buildNotificationsListQuery - uses custom filter when provided', () => {
  const customFilter = { type: { eq: 'issueAssignedToYou' } };
  const query = buildNotificationsListQuery({ filter: customFilter });
  // Should include custom filter instead of default
  assertStringIncludes(query, 'type:');
  assertStringIncludes(query, 'eq:');
  assertStringIncludes(query, '"issueAssignedToYou"');
});

Deno.test('buildNotificationsListQuery - always includes createdAt field', () => {
  // Even if user doesn't specify createdAt, it should be included
  const query = buildNotificationsListQuery({ fields: ['title', 'subtitle'] });
  assertStringIncludes(query, 'createdAt');
});
