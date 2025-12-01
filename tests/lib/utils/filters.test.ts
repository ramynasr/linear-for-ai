import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  buildMyResourcesFilter,
  type FilterObject,
  mergeFilters,
} from '../../../src/lib/utils/filters.ts';

Deno.test('buildMyResourcesFilter - builds issues filter', () => {
  const result = buildMyResourcesFilter('issues');
  assertEquals(result, {
    or: [
      { assignee: { isMe: { eq: true } } },
      { creator: { isMe: { eq: true } } },
      { subscribers: { some: { isMe: { eq: true } } } },
    ],
  });
});

Deno.test('buildMyResourcesFilter - builds projects filter', () => {
  const result = buildMyResourcesFilter('projects');
  assertEquals(result, {
    or: [
      { lead: { isMe: { eq: true } } },
      { creator: { isMe: { eq: true } } },
      { members: { some: { isMe: { eq: true } } } },
    ],
  });
});

Deno.test('buildMyResourcesFilter - throws on unknown resource type', () => {
  assertThrows(
    () => buildMyResourcesFilter('unknown' as 'issues'),
    Error,
    'Unknown resource type: unknown',
  );
});

Deno.test('mergeFilters - returns default filter when no user filter', () => {
  const defaultFilter: FilterObject = { assignee: { isMe: { eq: true } } };
  const result = mergeFilters(defaultFilter);
  assertEquals(result, defaultFilter);
});

Deno.test('mergeFilters - returns default filter when user filter is empty', () => {
  const defaultFilter: FilterObject = { assignee: { isMe: { eq: true } } };
  const result = mergeFilters(defaultFilter, {});
  assertEquals(result, defaultFilter);
});

Deno.test('mergeFilters - combines default and user filters with and', () => {
  const defaultFilter: FilterObject = { assignee: { isMe: { eq: true } } };
  const userFilter: FilterObject = { state: { type: { eq: 'started' } } };
  const result = mergeFilters(defaultFilter, userFilter);
  assertEquals(result, {
    and: [
      { assignee: { isMe: { eq: true } } },
      { state: { type: { eq: 'started' } } },
    ],
  });
});

Deno.test('mergeFilters - handles complex user filters', () => {
  const defaultFilter: FilterObject = { assignee: { isMe: { eq: true } } };
  const userFilter: FilterObject = {
    or: [
      { state: { type: { eq: 'started' } } },
      { state: { type: { eq: 'completed' } } },
    ],
  };
  const result = mergeFilters(defaultFilter, userFilter);
  assertEquals(result, {
    and: [
      { assignee: { isMe: { eq: true } } },
      {
        or: [
          { state: { type: { eq: 'started' } } },
          { state: { type: { eq: 'completed' } } },
        ],
      },
    ],
  });
});
