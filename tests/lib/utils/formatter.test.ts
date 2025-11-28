import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  formatEmptyResult,
  formatOutput,
  formatPaginationInfo,
} from '../../../src/lib/utils/formatter.ts';

Deno.test('formatOutput - returns markdown by default', () => {
  const data = { id: '123', name: 'Test' };
  const markdown = '**Test Data**';
  const result = formatOutput(data, 'markdown', markdown);
  assertEquals(result, markdown);
});

Deno.test('formatOutput - returns JSON when format is json', () => {
  const data = { id: '123', name: 'Test' };
  const result = formatOutput(data, 'json', 'markdown');
  assertEquals(result, JSON.stringify(data, null, 2));
});

Deno.test('formatEmptyResult - returns appropriate message', () => {
  const result = formatEmptyResult('projects');
  assertEquals(result, 'No projects found.');
});

Deno.test('formatPaginationInfo - returns empty string when hasNextPage is false', () => {
  const result = formatPaginationInfo(false, 'cursor123');
  assertEquals(result, '');
});

Deno.test('formatPaginationInfo - returns empty string when hasNextPage is false and endCursor is undefined', () => {
  const result = formatPaginationInfo(false);
  assertEquals(result, '');
});

Deno.test('formatPaginationInfo - returns pagination message with cursor when hasNextPage is true', () => {
  const result = formatPaginationInfo(true, 'cursor123');
  assertEquals(result, '\n\nTo see more results, use: --cursor "cursor123"');
});

Deno.test('formatPaginationInfo - returns empty string when hasNextPage is true but endCursor is undefined', () => {
  const result = formatPaginationInfo(true);
  assertEquals(result, '');
});
