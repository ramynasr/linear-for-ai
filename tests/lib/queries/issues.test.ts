import { assertStringIncludes } from '@std/assert';
import { buildIssueShowQuery, buildIssuesListQuery } from '../../../src/lib/queries/issues.ts';

Deno.test('buildIssuesListQuery - generates basic query', () => {
  const query = buildIssuesListQuery({});
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'issues');
  assertStringIncludes(query, 'nodes');
  assertStringIncludes(query, 'pageInfo');
});

Deno.test('buildIssuesListQuery - does not include empty parentheses when no parameters', () => {
  const query = buildIssuesListQuery({});
  // Should have "issues {" not "issues() {"
  assertStringIncludes(query, 'issues {');
  if (query.includes('issues()')) {
    throw new Error('Query should not contain empty parentheses "issues()"');
  }
});

Deno.test('buildIssuesListQuery - includes requested fields', () => {
  const query = buildIssuesListQuery({ fields: ['id', 'title', 'url'] });
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'title');
  assertStringIncludes(query, 'url');
});

Deno.test('buildIssuesListQuery - includes pagination parameters', () => {
  const query = buildIssuesListQuery({ limit: 25, cursor: 'abc123' });
  assertStringIncludes(query, 'first: 25');
  assertStringIncludes(query, 'after: "abc123"');
});

Deno.test('buildIssueShowQuery - generates query with identifier', () => {
  const query = buildIssueShowQuery('ENG-123', ['id', 'title']);
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'issue');
  assertStringIncludes(query, 'ENG-123');
});
