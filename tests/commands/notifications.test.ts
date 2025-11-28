import { assertEquals, assertStringIncludes } from '@std/assert';
import { list as notificationsList } from '../../src/commands/notifications/list/index.ts';
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

Deno.test('notificationsList - returns formatted markdown', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/notifications-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await notificationsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    { format: 'markdown' },
  );

  assertStringIncludes(result, '## Notifications');
  assertStringIncludes(result, 'Test issue assigned to you');
  assertStringIncludes(result, 'Assigned by John Doe');
  assertStringIncludes(result, 'https://linear.app/team/issue/TEST-123');
});

Deno.test('notificationsList - returns JSON format', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/notifications-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await notificationsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    { format: 'json' },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.nodes[0].title, 'Test issue assigned to you');
  assertEquals(parsed.nodes[0].subtitle, 'Assigned by John Doe');
});

Deno.test('notificationsList - passes filter to query', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/notifications-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const filterJson = '{"type":{"eq":"issueAssignedToYou"}}';

  await notificationsList(
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
  assertStringIncludes(client.lastQuery?.query || '', 'type:');
  assertStringIncludes(client.lastQuery?.query || '', 'eq:');
  assertStringIncludes(client.lastQuery?.query || '', '"issueAssignedToYou"');
});

Deno.test('notificationsList - passes limit to query', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/notifications-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);

  await notificationsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    { limit: 25 },
  );

  // Verify the query includes the limit
  assertStringIncludes(client.lastQuery?.query || '', 'first: 25');
});

Deno.test('notificationsList - includes pagination message when hasNextPage', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/notifications-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await notificationsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
    },
    { format: 'markdown' },
  );

  assertStringIncludes(result, 'Use --cursor=cursor-end for next page');
});
