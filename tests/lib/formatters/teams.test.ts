import { assertEquals, assertStringIncludes } from '@std/assert';
import { formatTeamDetail, formatTeamsList } from '../../../src/lib/formatters/teams.ts';
import type { LinearConnection, LinearTeam } from '../../../src/types/linear.ts';

const mockTeam: LinearTeam = {
  id: '1',
  key: 'ENG',
  name: 'Engineering',
  description: 'Engineering team working on product development',
  url: 'https://linear.app/team/ENG',
};

Deno.test('formatTeamsList - formats teams as markdown table', () => {
  const connection: LinearConnection<LinearTeam> = {
    nodes: [mockTeam],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatTeamsList(connection, 'markdown');
  assertStringIncludes(result, '## Teams');
  assertStringIncludes(result, 'ENG');
  assertStringIncludes(result, 'Engineering');
  assertStringIncludes(result, 'https://linear.app/team/ENG');
});

Deno.test('formatTeamsList - formats as JSON', () => {
  const connection: LinearConnection<LinearTeam> = {
    nodes: [mockTeam],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatTeamsList(connection, 'json');
  const parsed = JSON.parse(result);
  assertEquals(parsed.data.teams.nodes[0].key, 'ENG');
  assertEquals(parsed.data.teams.nodes[0].name, 'Engineering');
});

Deno.test('formatTeamDetail - formats single team', () => {
  const result = formatTeamDetail(mockTeam, 'markdown');
  assertStringIncludes(result, '## Engineering (ENG)');
  assertStringIncludes(result, 'Key:');
  assertStringIncludes(result, 'ENG');
  assertStringIncludes(result, 'URL:');
  assertStringIncludes(result, 'https://linear.app/team/ENG');
  assertStringIncludes(result, 'Description');
  assertStringIncludes(result, 'Engineering team working on product development');
});
