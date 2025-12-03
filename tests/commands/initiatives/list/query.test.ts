import { assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { buildQuery } from '../../../../src/commands/initiatives/list/query.ts';

Deno.test('buildQuery - builds basic query with fields and limit', () => {
  const query = buildQuery({
    fields: ['id', 'name', 'status'],
    limit: 50,
  });

  assertStringIncludes(query, 'query {');
  assertStringIncludes(query, 'initiatives(first: 50');
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'name');
  assertStringIncludes(query, 'status');
  assertStringIncludes(query, 'pageInfo');
  assertStringIncludes(query, 'hasNextPage');
  assertStringIncludes(query, 'endCursor');
});

Deno.test('buildQuery - includes cursor when provided', () => {
  const query = buildQuery({
    fields: ['id', 'name'],
    limit: 50,
    cursor: 'abc123',
  });

  assertStringIncludes(query, 'after: "abc123"');
});

Deno.test('buildQuery - includes filter when provided', () => {
  const query = buildQuery({
    fields: ['id', 'name'],
    limit: 50,
    filter: { status: { eq: 'active' } },
  });

  assertStringIncludes(query, 'filter:');
  assertStringIncludes(query, 'status');
});

Deno.test('buildQuery - handles nested fields', () => {
  const query = buildQuery({
    fields: ['id', 'name', 'owner.displayName'],
    limit: 50,
  });

  assertStringIncludes(query, 'owner');
  assertStringIncludes(query, 'displayName');
});

Deno.test('buildQuery - handles different limit values', () => {
  const query = buildQuery({
    fields: ['id'],
    limit: 25,
  });

  assertStringIncludes(query, 'initiatives(first: 25');
});

Deno.test('buildQuery - works without cursor or filter', () => {
  const query = buildQuery({
    fields: ['id', 'slugId'],
    limit: 10,
  });

  assertStringIncludes(query, 'initiatives(first: 10');
  assertStringIncludes(query, 'nodes {');
  assertStringIncludes(query, 'pageInfo {');
});
