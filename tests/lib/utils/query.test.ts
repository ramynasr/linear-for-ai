import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { buildFieldSelection, buildPaginationParams } from '../../../src/lib/utils/query.ts';

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
