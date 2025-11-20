import { assertEquals, assertStringIncludes } from '@std/assert';
import { formatIssuesList, formatIssueDetail } from '../../../src/lib/formatters/issues.ts';
import type { LinearIssue, LinearConnection } from '../../../src/types/linear.ts';

const mockIssue: LinearIssue = {
  id: '1',
  identifier: 'ENG-123',
  title: 'Fix login bug',
  priority: 1,
  priorityLabel: 'High',
  state: { id: '1', name: 'In Progress', type: 'started', color: '#f2c94c' },
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-17T15:30:00Z',
  url: 'https://linear.app/team/issue/ENG-123',
};

Deno.test('formatIssuesList - formats issues as markdown table', () => {
  const connection: LinearConnection<LinearIssue> = {
    nodes: [mockIssue],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatIssuesList(connection, 'markdown');
  assertStringIncludes(result, '## Issues');
  assertStringIncludes(result, 'ENG-123');
  assertStringIncludes(result, 'Fix login bug');
  assertStringIncludes(result, 'https://linear.app/team/issue/ENG-123');
});

Deno.test('formatIssuesList - formats as JSON', () => {
  const connection: LinearConnection<LinearIssue> = {
    nodes: [mockIssue],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatIssuesList(connection, 'json');
  const parsed = JSON.parse(result);
  assertEquals(parsed.data.issues.nodes[0].identifier, 'ENG-123');
});

Deno.test('formatIssueDetail - formats single issue', () => {
  const result = formatIssueDetail(mockIssue, 'markdown');
  assertStringIncludes(result, '## ENG-123');
  assertStringIncludes(result, 'Fix login bug');
  assertStringIncludes(result, 'Status:');
  assertStringIncludes(result, 'In Progress');
  assertStringIncludes(result, 'Priority:');
  assertStringIncludes(result, 'High');
});
