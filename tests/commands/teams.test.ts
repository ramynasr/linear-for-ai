import { assertEquals, assertStringIncludes } from '@std/assert';
import { teamsList, teamsShow } from '../../src/commands/teams.ts';
import { GraphQLClient } from '../../src/lib/graphql-client.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';

// Mock GraphQL client for testing
class MockGraphQLClient extends GraphQLClient {
  private mockResponse: unknown;
  public lastQuery?: { query: string };

  constructor(mockResponse: unknown) {
    super('test_key');
    this.mockResponse = mockResponse;
  }

  override query<T>(params: { query: string }): Promise<{ data: T }> {
    this.lastQuery = params;
    return Promise.resolve(this.mockResponse as { data: T });
  }
}

Deno.test('teamsList - returns formatted markdown', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/teams-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await teamsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    { format: 'markdown' },
  );

  assertStringIncludes(result, '## Teams');
  assertStringIncludes(result, 'ENG');
  assertStringIncludes(result, 'Engineering');
});

Deno.test('teamsList - returns JSON format', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/teams-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await teamsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    { format: 'json' },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.data.teams.nodes[0].key, 'ENG');
  assertEquals(parsed.data.teams.nodes[0].name, 'Engineering');
});

Deno.test('teamsList - passes filter to query', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/teams-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const filterJson = '{"key":{"eq":"ENG"}}';

  await teamsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    { filter: filterJson },
  );

  // Verify the query includes the filter with GraphQL syntax (unquoted keys)
  assertStringIncludes(client.lastQuery?.query || '', 'filter:');
  assertStringIncludes(client.lastQuery?.query || '', 'key:');
  assertStringIncludes(client.lastQuery?.query || '', 'eq:');
  assertStringIncludes(client.lastQuery?.query || '', '"ENG"');
});

Deno.test('teamsShow - returns formatted markdown', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/teams-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  // Mock response for single team
  const singleTeamFixture = {
    data: {
      team: fixture.data.teams.nodes[0],
    },
  };

  const client = new MockGraphQLClient(singleTeamFixture);
  const result = await teamsShow(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    'team-id-123',
    { format: 'markdown' },
  );

  assertStringIncludes(result, '## Engineering (ENG)');
  assertStringIncludes(result, 'Key:');
  assertStringIncludes(result, 'ENG');
});
