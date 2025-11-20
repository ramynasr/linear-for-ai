import { assertStringIncludes } from '@std/assert';
import {
  buildProjectsListQuery,
  buildProjectShowQuery,
  buildProjectIssuesQuery,
} from '../../../src/lib/queries/projects.ts';

Deno.test('buildProjectsListQuery - generates basic query', () => {
  const query = buildProjectsListQuery({});
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'projects');
  assertStringIncludes(query, 'nodes');
  assertStringIncludes(query, 'pageInfo');
});

Deno.test('buildProjectsListQuery - includes requested fields', () => {
  const query = buildProjectsListQuery({ fields: ['id', 'name', 'url'] });
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'name');
  assertStringIncludes(query, 'url');
});

Deno.test('buildProjectsListQuery - includes pagination parameters', () => {
  const query = buildProjectsListQuery({ limit: 25, cursor: 'abc123' });
  assertStringIncludes(query, 'first: 25');
  assertStringIncludes(query, 'after: "abc123"');
});

Deno.test('buildProjectShowQuery - generates query with id', () => {
  const query = buildProjectShowQuery('project-id-123', ['id', 'name']);
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'project');
  assertStringIncludes(query, 'project-id-123');
});

Deno.test('buildProjectIssuesQuery - generates query with project id', () => {
  const query = buildProjectIssuesQuery('project-id-123', {});
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'project');
  assertStringIncludes(query, 'project-id-123');
  assertStringIncludes(query, 'issues');
  assertStringIncludes(query, 'nodes');
});

Deno.test('buildProjectIssuesQuery - includes pagination parameters', () => {
  const query = buildProjectIssuesQuery('project-id-123', { limit: 10, cursor: 'xyz' });
  assertStringIncludes(query, 'first: 10');
  assertStringIncludes(query, 'after: "xyz"');
});
