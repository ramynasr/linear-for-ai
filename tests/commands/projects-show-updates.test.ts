import { assertEquals, assertStringIncludes } from '@std/assert';
import { buildQuery } from '../../src/commands/projects/show-updates/query.ts';

Deno.test('buildQuery - constructs query with default date (14 days ago)', () => {
  const query = buildQuery({
    sinceDate: '2025-11-14',
    limit: 10,
    showAllIssues: false,
  });

  // Should include projectUpdates query at root level
  assertStringIncludes(query, 'projectUpdates(');
  assertStringIncludes(query, 'filter:');

  // Should filter projectUpdates by date
  assertStringIncludes(query, 'createdAt:');
  assertStringIncludes(query, 'gte: "2025-11-14"');

  // Should filter projectUpdates by project membership
  assertStringIncludes(query, 'project:');
  assertStringIncludes(query, 'members:');
  assertStringIncludes(query, 'some:');
  assertStringIncludes(query, 'isMe:');
  assertStringIncludes(query, 'lead:');

  // Should include project data in projectUpdates response
  assertStringIncludes(query, 'project {');

  // Should include projects query for issues
  assertStringIncludes(query, 'projects(');
  assertStringIncludes(query, 'issues(');

  // Should include pagination on projects
  assertStringIncludes(query, 'first: 10');

  // Should include project fields
  assertStringIncludes(query, 'name');
  assertStringIncludes(query, 'url');
  assertStringIncludes(query, 'description');
  assertStringIncludes(query, 'health');
  assertStringIncludes(query, 'targetDate');
  assertStringIncludes(query, 'state');

  // Should include issues with completedAt filter (not showAllIssues)
  assertStringIncludes(query, 'completedAt: { gte: "2025-11-14" }');
});

Deno.test('buildQuery - includes cursor when provided', () => {
  const query = buildQuery({
    sinceDate: '2025-11-14',
    limit: 10,
    cursor: 'test-cursor-123',
    showAllIssues: false,
  });

  assertStringIncludes(query, 'after: "test-cursor-123"');
});

Deno.test('buildQuery - uses different issue filter when showAllIssues is true', () => {
  const query = buildQuery({
    sinceDate: '2025-11-14',
    limit: 10,
    showAllIssues: true,
  });

  // Should only filter by updatedAt, not completedAt
  assertStringIncludes(query, 'issues(');
  assertStringIncludes(query, 'updatedAt: { gte: "2025-11-14" }');
  // Should NOT include completedAt filter
  assertEquals(query.includes('completedAt'), false);
});

Deno.test('buildQuery - limits issues to 20 per project', () => {
  const query = buildQuery({
    sinceDate: '2025-11-14',
    limit: 10,
    showAllIssues: false,
  });

  // Should limit issues to 20
  assertStringIncludes(query, 'issues(');
  assertStringIncludes(query, 'first: 20');
});

Deno.test('buildQuery - includes issue fields', () => {
  const query = buildQuery({
    sinceDate: '2025-11-14',
    limit: 10,
    showAllIssues: false,
  });

  // Should include required issue fields
  assertStringIncludes(query, 'identifier');
  assertStringIncludes(query, 'title');
  assertStringIncludes(query, 'state {');
});

Deno.test('buildQuery - includes project update fields', () => {
  const query = buildQuery({
    sinceDate: '2025-11-14',
    limit: 10,
    showAllIssues: false,
  });

  // Should include project update fields
  assertStringIncludes(query, 'projectUpdates(');
  assertStringIncludes(query, 'body');
  assertStringIncludes(query, 'createdAt');
  assertStringIncludes(query, 'user {');
  assertStringIncludes(query, 'displayName');
});

Deno.test('buildQuery - includes idOrUrl parameter', () => {
  const query = buildQuery({
    sinceDate: '2025-01-01',
    limit: 10,
    showAllIssues: false,
    idOrUrl: 'project-123',
  });

  assertStringIncludes(query, 'project-123');
  // Should query single project, not projects with filters
  assertStringIncludes(query, 'project(id:');
});
