import { assertEquals, assertRejects, assertStringIncludes } from '@std/assert';
import { list as issuesList } from '../../src/commands/issues/list/index.ts';
import { show as issuesShow } from '../../src/commands/issues/show/index.ts';
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

Deno.test('issuesList - returns formatted markdown', async () => {
  const fixturePath = new URL('../../tests/fixtures/issues-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await issuesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'markdown' },
      args: [],
    },
  );

  assertStringIncludes(result, '## Issues');
  assertStringIncludes(result, 'ENG-123');
  assertStringIncludes(result, 'Fix login bug');
});

Deno.test('issuesList - returns JSON format', async () => {
  const fixturePath = new URL('../../tests/fixtures/issues-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await issuesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'json' },
      args: [],
    },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.nodes[0].identifier, 'ENG-123');
});

Deno.test('issuesList - passes filter to query', async () => {
  const fixturePath = new URL('../../tests/fixtures/issues-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const filterJson = '{"state":{"eq":"in_progress"}}';

  await issuesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { filter: filterJson },
      args: [],
    },
  );

  // Verify the query includes the filter with GraphQL syntax (unquoted keys)
  assertStringIncludes(client.lastQuery?.query || '', 'filter:');
  assertStringIncludes(client.lastQuery?.query || '', 'state:');
  assertStringIncludes(client.lastQuery?.query || '', 'eq:');
  assertStringIncludes(client.lastQuery?.query || '', '"in_progress"');
});

Deno.test('issuesList - throws error on invalid filter JSON', async () => {
  const fixturePath = new URL('../../tests/fixtures/issues-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const invalidFilterJson = '{invalid json}';

  try {
    await issuesList(
      client,
      {
        config: DEFAULT_CONFIG,
        env: { apiKey: 'test' },
        options: { filter: invalidFilterJson },
        args: [],
      },
    );
    throw new Error('Expected error to be thrown');
  } catch (error) {
    assertStringIncludes((error as Error).message, 'Invalid filter JSON');
  }
});

Deno.test('issuesList - applies default "my resources" filter by default', async () => {
  const fixturePath = new URL('../../tests/fixtures/issues-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  await issuesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {}, // No fetchAll flag
      args: [],
    },
  );

  // Verify query includes default filter with OR conditions for assignee/creator/subscribers
  const query = client.lastQuery?.query || '';
  assertStringIncludes(query, 'filter:');
  assertStringIncludes(query, 'or:');
  assertStringIncludes(query, 'assignee:');
  assertStringIncludes(query, 'isMe:');
  assertStringIncludes(query, 'creator:');
  assertStringIncludes(query, 'subscribers:');
});

Deno.test('issuesList - bypasses default filter with fetchAll flag', async () => {
  const fixturePath = new URL('../../tests/fixtures/issues-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  await issuesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { fetchAll: true },
      args: [],
    },
  );

  // Verify query does NOT include default "my resources" filter
  const query = client.lastQuery?.query || '';
  // Should have no filter parameter at all
  // Check that issues() doesn't have filter parameter (or only has first parameter)
  assertStringIncludes(query, 'issues(first:');
  // Should NOT have the default "my resources" filter with assignee/creator/subscribers
  if (query.includes('filter:')) {
    // If filter exists, it should NOT be the default one
    assertEquals(query.includes('assignee:') && query.includes('isMe:'), false);
  }
});

Deno.test('issuesList - merges default filter with user filter using AND', async () => {
  const fixturePath = new URL('../../tests/fixtures/issues-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const userFilter = '{"state":{"type":{"eq":"started"}}}';
  await issuesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { filter: userFilter }, // No fetchAll flag
      args: [],
    },
  );

  // Verify query includes AND with both default filter and user filter
  const query = client.lastQuery?.query || '';
  assertStringIncludes(query, 'and:');
  assertStringIncludes(query, 'or:'); // from default filter
  assertStringIncludes(query, 'assignee:'); // from default filter
  assertStringIncludes(query, 'state:'); // from user filter
  assertStringIncludes(query, 'started'); // from user filter
});

Deno.test('issuesShow - throws error with no arguments', async () => {
  const client = new MockGraphQLClient({});

  await assertRejects(
    async () => {
      await issuesShow(
        client,
        {
          config: DEFAULT_CONFIG,
          env: { apiKey: 'test' },
          options: {},
          args: [],
        },
      );
    },
    Error,
    'Exactly one issue identifier is required for the show command',
  );
});

Deno.test('issuesShow - throws error with multiple arguments', async () => {
  const client = new MockGraphQLClient({});

  await assertRejects(
    async () => {
      await issuesShow(
        client,
        {
          config: DEFAULT_CONFIG,
          env: { apiKey: 'test' },
          options: {},
          args: ['ABC-123', 'XYZ-456'],
        },
      );
    },
    Error,
    'Exactly one issue identifier is required for the show command',
  );
});
