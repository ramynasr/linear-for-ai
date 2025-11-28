import { assertEquals } from '@std/assert';
import { toGraphQLSyntax } from '../../src/lib/graphql-syntax.ts';

Deno.test('toGraphQLSyntax - converts simple object', () => {
  const input = { state: { eq: 'in_progress' } };
  const expected = '{state: {eq: "in_progress"}}';
  assertEquals(toGraphQLSyntax(input), expected);
});

Deno.test('toGraphQLSyntax - converts nested object', () => {
  const input = { members: { some: { isMe: { eq: true } } } };
  const expected = '{members: {some: {isMe: {eq: true}}}}';
  assertEquals(toGraphQLSyntax(input), expected);
});

Deno.test('toGraphQLSyntax - handles boolean values', () => {
  const input = { active: true, archived: false };
  const expected = '{active: true, archived: false}';
  assertEquals(toGraphQLSyntax(input), expected);
});

Deno.test('toGraphQLSyntax - handles number values', () => {
  const input = { priority: 1, limit: 50 };
  const expected = '{priority: 1, limit: 50}';
  assertEquals(toGraphQLSyntax(input), expected);
});

Deno.test('toGraphQLSyntax - handles null values', () => {
  const input = { assignee: null };
  const expected = '{assignee: null}';
  assertEquals(toGraphQLSyntax(input), expected);
});
