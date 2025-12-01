import { assertEquals, assertStringIncludes } from '@std/assert';
import { formatProjectDetail, formatProjectsList } from '../../../src/lib/formatters/projects.ts';
import type { LinearConnection, LinearProject } from '../../../src/types/linear.ts';

const mockProject: LinearProject = {
  id: '1',
  name: 'Q1 Engineering Goals',
  description: 'Key engineering objectives for Q1',
  state: 'started',
  progress: 65,
  startDate: '2025-01-01',
  targetDate: '2025-03-31',
  lead: {
    id: '1',
    name: 'Alice Smith',
    displayName: 'Alice',
    email: 'alice@example.com',
  },
  status: {
    name: 'In Progress',
    type: 'started',
  },
  url: 'https://linear.app/team/project/q1-engineering-goals',
};

Deno.test('formatProjectsList - formats projects as markdown table', () => {
  const connection: LinearConnection<LinearProject> = {
    nodes: [mockProject],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatProjectsList(connection, 'markdown');
  assertStringIncludes(result, '## Projects');
  assertStringIncludes(result, 'Q1 Engineering Goals');
  assertStringIncludes(result, '65');
  assertStringIncludes(result, 'https://linear.app/team/project/q1-engineering-goals');
});

Deno.test('formatProjectsList - formats as JSON', () => {
  const connection: LinearConnection<LinearProject> = {
    nodes: [mockProject],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatProjectsList(connection, 'json');
  const parsed = JSON.parse(result);
  assertEquals(parsed.data.projects.nodes[0].name, 'Q1 Engineering Goals');
});

Deno.test('formatProjectDetail - formats single project', () => {
  const result = formatProjectDetail(mockProject, 'markdown');
  assertStringIncludes(result, '## Q1 Engineering Goals');
  assertStringIncludes(result, 'State:');
  assertStringIncludes(result, 'started');
  assertStringIncludes(result, 'Progress:');
  assertStringIncludes(result, '65%');
  assertStringIncludes(result, 'Lead:');
  assertStringIncludes(result, '@Alice');
});

Deno.test('formatProjectsList - handles nested fields with dot notation', () => {
  const connection: LinearConnection<LinearProject> = {
    nodes: [mockProject],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  // Simulate user requesting specific fields including nested ones
  const fields = ['id', 'name', 'status.name'];
  const result = formatProjectsList(connection, 'markdown', fields);

  // Should show the status name, NOT "[object Object]"
  assertStringIncludes(result, 'In Progress');
  assertEquals(result.includes('[object Object]'), false, 'Should not contain [object Object]');
});
