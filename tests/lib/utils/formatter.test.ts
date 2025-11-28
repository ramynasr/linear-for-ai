import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { formatEmptyResult, formatOutput } from '../../../src/lib/utils/formatter.ts';

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
