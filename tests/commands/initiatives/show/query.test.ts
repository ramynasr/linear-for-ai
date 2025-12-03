import { assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { buildQuery } from '../../../../src/commands/initiatives/show/query.ts';

Deno.test('buildQuery - builds query with identifier', () => {
  const query = buildQuery('INI-123', ['id', 'name', 'status']);

  assertStringIncludes(query, 'query {');
  assertStringIncludes(query, 'initiative(id: "INI-123")');
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'name');
  assertStringIncludes(query, 'status');
});

Deno.test('buildQuery - includes owner fields when requested', () => {
  const query = buildQuery('INI-123', ['id', 'name', 'owner']);

  assertStringIncludes(query, 'owner { id displayName email }');
});

Deno.test('buildQuery - includes owner fields with dot notation', () => {
  const query = buildQuery('INI-123', ['id', 'name', 'owner.displayName']);

  assertStringIncludes(query, 'owner { id displayName email }');
});

Deno.test('buildQuery - includes creator fields when requested', () => {
  const query = buildQuery('INI-123', ['id', 'name', 'creator']);

  assertStringIncludes(query, 'creator { id displayName email }');
});

Deno.test('buildQuery - includes projects with date filter when requested', () => {
  const query = buildQuery('INI-123', ['id', 'name', 'projects']);

  assertStringIncludes(query, 'projects(first: 50, filter:');
  assertStringIncludes(query, 'updatedAt: { gte:');
  assertStringIncludes(query, 'nodes {');
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'name');
  assertStringIncludes(query, 'status');
  assertStringIncludes(query, 'url');
});

Deno.test('buildQuery - includes sub-initiatives when requested', () => {
  const query = buildQuery('INI-123', ['id', 'name', 'subInitiatives']);

  assertStringIncludes(query, 'subInitiatives(first: 50)');
  assertStringIncludes(query, 'health');
  assertStringIncludes(query, 'slugId');
});

Deno.test('buildQuery - includes lastUpdate when requested', () => {
  const query = buildQuery('INI-123', ['id', 'name', 'lastUpdate']);

  assertStringIncludes(query, 'lastUpdate {');
  assertStringIncludes(query, 'body');
  assertStringIncludes(query, 'createdAt');
  assertStringIncludes(query, 'user { displayName }');
});

Deno.test('buildQuery - includes all nested fields when requested', () => {
  const query = buildQuery('INI-123', [
    'id',
    'name',
    'owner',
    'creator',
    'projects',
    'subInitiatives',
    'lastUpdate',
  ]);

  assertStringIncludes(query, 'owner { id displayName email }');
  assertStringIncludes(query, 'creator { id displayName email }');
  assertStringIncludes(query, 'projects(first: 50');
  assertStringIncludes(query, 'subInitiatives(first: 50)');
  assertStringIncludes(query, 'lastUpdate {');
});

Deno.test('buildQuery - works with UUID identifier', () => {
  const query = buildQuery('abc-123-def-456', ['id', 'name']);

  assertStringIncludes(query, 'initiative(id: "abc-123-def-456")');
});

Deno.test('buildQuery - handles basic fields without nested resources', () => {
  const query = buildQuery('INI-999', ['id', 'slugId', 'status', 'health', 'url']);

  assertStringIncludes(query, 'initiative(id: "INI-999")');
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'slugId');
  assertStringIncludes(query, 'status');
  assertStringIncludes(query, 'health');
  assertStringIncludes(query, 'url');
});
