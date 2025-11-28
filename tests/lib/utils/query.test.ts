import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  buildFieldSelection,
  buildFilterClause,
  buildPaginationParams,
} from '../../../src/lib/utils/query.ts';

Deno.test('buildFieldSelection - formats fields as newline-separated string', () => {
  const fields = ['id', 'title', 'state { name }'];
  const result = buildFieldSelection(fields);
  assertEquals(result, 'id\n    title\n    state { name }');
});

Deno.test('buildFieldSelection - handles single field', () => {
  const fields = ['id'];
  const result = buildFieldSelection(fields);
  assertEquals(result, 'id');
});

Deno.test('buildPaginationParams - builds params object', () => {
  const result = buildPaginationParams(50, 'cursor123');
  assertEquals(result, { first: 50, after: 'cursor123' });
});

Deno.test('buildPaginationParams - handles missing cursor', () => {
  const result = buildPaginationParams(25);
  assertEquals(result, { first: 25 });
});

Deno.test('buildFilterClause - returns empty string when filter is undefined', () => {
  const result = buildFilterClause(undefined);
  assertEquals(result, '');
});

Deno.test('buildFilterClause - returns empty string when filter is null', () => {
  const result = buildFilterClause(null as unknown as Record<string, unknown>);
  assertEquals(result, '');
});

Deno.test('buildFilterClause - correctly formats filter with GraphQL syntax', () => {
  const filter = { state: { eq: 'in_progress' } };
  const result = buildFilterClause(filter);
  assertEquals(result, ', filter: {state: {eq: "in_progress"}}');
});

Deno.test('buildFilterClause - includes filter prefix in result', () => {
  const filter = { status: 'active' };
  const result = buildFilterClause(filter);
  assertEquals(result.startsWith(', filter: '), true);
});

Deno.test('buildFilterClause - handles complex nested filters', () => {
  const filter = { or: [{ status: 'active' }, { archived: false }] };
  const result = buildFilterClause(filter);
  assertEquals(result, ', filter: {or: [{status: "active"}, {archived: false}]}');
});

Deno.test('buildFilterClause - handles string values with escaping', () => {
  const filter = { name: 'test "quoted" value' };
  const result = buildFilterClause(filter);
  assertEquals(result, ', filter: {name: "test \\"quoted\\" value"}');
});
