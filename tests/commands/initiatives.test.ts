import { assertEquals, assertRejects, assertStringIncludes } from '@std/assert';
import { list as initiativesList } from '../../src/commands/initiatives/list/index.ts';
import { show as initiativesShow } from '../../src/commands/initiatives/show/index.ts';
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

Deno.test('initiativesList - returns formatted markdown', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await initiativesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'markdown' },
      args: [],
    },
  );

  assertStringIncludes(result, '## Initiatives');
  assertStringIncludes(result, 'Q4 Platform Initiative');
  assertStringIncludes(result, 'abc123def456');
});

Deno.test('initiativesList - returns JSON format', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await initiativesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'json' },
      args: [],
    },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.nodes[0].slugId, 'abc123def456');
  assertEquals(parsed.nodes[0].name, 'Q4 Platform Initiative');
});

Deno.test('initiativesList - passes filter to query', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const filterJson = '{"status":{"eq":"planned"}}';

  await initiativesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { filter: filterJson },
      args: [],
    },
  );

  // Verify the query includes the filter with GraphQL syntax
  assertStringIncludes(client.lastQuery?.query || '', 'filter:');
  assertStringIncludes(client.lastQuery?.query || '', 'status:');
  assertStringIncludes(client.lastQuery?.query || '', 'eq:');
  assertStringIncludes(client.lastQuery?.query || '', '"planned"');
});

Deno.test('initiativesList - applies default "owner:me" filter by default', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  await initiativesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {}, // No fetchAll flag
      args: [],
    },
  );

  // Verify query includes default owner.isMe filter
  const query = client.lastQuery?.query || '';
  assertStringIncludes(query, 'filter:');
  assertStringIncludes(query, 'owner:');
  assertStringIncludes(query, 'isMe:');
});

Deno.test('initiativesList - bypasses default filter with fetchAll flag', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  await initiativesList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { fetchAll: true },
      args: [],
    },
  );

  // Verify query does NOT include default "owner:me" filter
  const query = client.lastQuery?.query || '';
  // Should have no filter parameter, or if it has filter, should NOT be owner.isMe
  if (query.includes('filter:')) {
    assertEquals(query.includes('owner:') && query.includes('isMe:'), false);
  }
});

Deno.test('initiativesList - merges default filter with user filter using AND', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-list.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const userFilter = '{"status":{"eq":"started"}}';
  await initiativesList(
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
  assertStringIncludes(query, 'owner:'); // from default filter
  assertStringIncludes(query, 'status:'); // from user filter
  assertStringIncludes(query, 'started'); // from user filter
});

Deno.test('initiativesShow - returns formatted markdown', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-show.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await initiativesShow(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'markdown' },
      args: ['abc123def456'],
    },
  );

  assertStringIncludes(result, 'Q4 Platform Initiative');
  assertStringIncludes(result, 'abc123def456');
  assertStringIncludes(result, 'planned');
  assertStringIncludes(result, 'Major platform improvements');
});

Deno.test('initiativesShow - returns JSON format', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-show.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await initiativesShow(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'json' },
      args: ['abc123def456'],
    },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.slugId, 'abc123def456');
  assertEquals(parsed.name, 'Q4 Platform Initiative');
});

Deno.test('initiativesShow - extracts identifier from URL', async () => {
  const fixturePath = new URL('../../tests/fixtures/initiatives-show.json', import.meta.url).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const url = 'https://linear.app/team/initiative/q4-platform-abc123def456';

  await initiativesShow(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
      args: [url],
    },
  );

  // Verify the extracted identifier is used in the query
  const query = client.lastQuery?.query || '';
  assertStringIncludes(query, 'initiative(');
  assertStringIncludes(query, 'id:');
});

Deno.test('initiativesShow - throws error with no arguments', async () => {
  const client = new MockGraphQLClient({});

  await assertRejects(
    async () => {
      await initiativesShow(
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
    'Exactly one initiative identifier is required for the show command',
  );
});

Deno.test('initiativesShow - throws error with multiple arguments', async () => {
  const client = new MockGraphQLClient({});

  await assertRejects(
    async () => {
      await initiativesShow(
        client,
        {
          config: DEFAULT_CONFIG,
          env: { apiKey: 'test' },
          options: {},
          args: ['abc123', 'xyz789'],
        },
      );
    },
    Error,
    'Exactly one initiative identifier is required for the show command',
  );
});
