import { assertEquals, assertStringIncludes } from '@std/assert';
import { formatKeyValue, formatTable, truncate } from '../../../src/lib/formatters/markdown.ts';

Deno.test('truncate - truncates long strings', () => {
  const long = 'a'.repeat(300);
  const result = truncate(long, 250);
  assertEquals(result.length, 253); // 250 + "..."
  assertStringIncludes(result, '...');
});

Deno.test('truncate - preserves short strings', () => {
  const short = 'hello world';
  const result = truncate(short, 250);
  assertEquals(result, 'hello world');
});

Deno.test('formatTable - creates aligned table', () => {
  const headers = ['ID', 'Title', 'Status'];
  const rows = [
    ['ENG-1', 'Fix bug', 'Done'],
    ['ENG-2', 'Add feature', 'In Progress'],
  ];
  const result = formatTable(headers, rows);

  assertStringIncludes(result, 'ID');
  assertStringIncludes(result, 'Title');
  assertStringIncludes(result, 'Status');
  assertStringIncludes(result, 'ENG-1');
  assertStringIncludes(result, 'Fix bug');
  assertStringIncludes(result, '---');
});

Deno.test('formatKeyValue - creates key-value pairs', () => {
  const pairs: Array<[string, string]> = [
    ['Status', 'In Progress'],
    ['Assignee', '@alice'],
    ['Priority', 'High'],
  ];
  const result = formatKeyValue(pairs);

  assertStringIncludes(result, 'Status:');
  assertStringIncludes(result, 'In Progress');
  assertStringIncludes(result, 'Assignee:');
  assertStringIncludes(result, '@alice');
});
