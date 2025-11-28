import { assertEquals, assertStringIncludes } from '@std/assert';
import { list as issuesList } from '../../src/commands/issues/list/index.ts';
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
      options: {},
    },
    { format: 'markdown' },
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
      options: {},
    },
    { format: 'json' },
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
      options: {},
    },
    { filter: filterJson },
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
        options: {},
      },
      { filter: invalidFilterJson },
    );
    throw new Error('Expected error to be thrown');
  } catch (error) {
    assertStringIncludes((error as Error).message, 'Invalid filter JSON');
  }
});
