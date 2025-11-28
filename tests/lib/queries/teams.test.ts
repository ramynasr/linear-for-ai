import { assertStringIncludes } from '@std/assert';
import { buildTeamShowQuery, buildTeamsListQuery } from '../../../src/lib/queries/teams.ts';

Deno.test('buildTeamsListQuery - generates basic query', () => {
  const query = buildTeamsListQuery({});
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'teams');
  assertStringIncludes(query, 'nodes');
  assertStringIncludes(query, 'pageInfo');
});

Deno.test('buildTeamsListQuery - includes requested fields', () => {
  const query = buildTeamsListQuery({ fields: ['id', 'key', 'name', 'url'] });
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'key');
  assertStringIncludes(query, 'name');
  assertStringIncludes(query, 'url');
});

Deno.test('buildTeamsListQuery - includes pagination parameters', () => {
  const query = buildTeamsListQuery({ limit: 25, cursor: 'abc123' });
  assertStringIncludes(query, 'first: 25');
  assertStringIncludes(query, 'after: "abc123"');
});

Deno.test('buildTeamShowQuery - generates query with id', () => {
  const query = buildTeamShowQuery('team-id-123', ['id', 'key', 'name']);
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'team');
  assertStringIncludes(query, 'team-id-123');
});
