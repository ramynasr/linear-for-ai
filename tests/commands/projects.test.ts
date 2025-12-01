import { assertEquals, assertStringIncludes } from '@std/assert';
import { list as projectsList } from '../../src/commands/projects/list/index.ts';
import { show as projectsShow } from '../../src/commands/projects/show/index.ts';
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

Deno.test('projectsList - returns formatted markdown', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/projects-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await projectsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'markdown' },
      args: [],
    },
  );

  assertStringIncludes(result, '## Projects');
  assertStringIncludes(result, 'Q1 Engineering Goals');
});

Deno.test('projectsList - returns JSON format', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/projects-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const result = await projectsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'json' },
      args: [],
    },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.nodes[0].name, 'Q1 Engineering Goals');
});

Deno.test('projectsList - passes filter to query', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/projects-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const filterJson = '{"members":{"some":{"isMe":{"eq":true}}}}';

  await projectsList(
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
  assertStringIncludes(client.lastQuery?.query || '', 'members:');
  assertStringIncludes(client.lastQuery?.query || '', 'some:');
  assertStringIncludes(client.lastQuery?.query || '', 'isMe:');
});

Deno.test('projectsShow - returns formatted markdown', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/projects-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  // Mock response for single project
  const singleProjectFixture = {
    data: {
      project: fixture.data.projects.nodes[0],
    },
  };

  const client = new MockGraphQLClient(singleProjectFixture);
  const result = await projectsShow(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'markdown' },
      args: ['project-id-123'],
    },
  );

  assertStringIncludes(result, '## Q1 Engineering Goals');
  assertStringIncludes(result, 'State:');
  assertStringIncludes(result, 'Progress:');
});

Deno.test('projectsList - applies default "my resources" filter by default', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/projects-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  await projectsList(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {}, // No fetchAll flag
      args: [],
    },
  );

  // Verify query includes default filter with OR conditions for lead/creator/members
  const query = client.lastQuery?.query || '';
  assertStringIncludes(query, 'filter:');
  assertStringIncludes(query, 'or:');
  assertStringIncludes(query, 'lead:');
  assertStringIncludes(query, 'isMe:');
  assertStringIncludes(query, 'creator:');
  assertStringIncludes(query, 'members:');
});

Deno.test('projectsList - bypasses default filter with fetchAll flag', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/projects-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  await projectsList(
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
  // Check that projects() doesn't have filter parameter (or only has first parameter)
  assertStringIncludes(query, 'projects(first:');
  // Should NOT have the default "my resources" filter with lead/creator/members
  if (query.includes('filter:')) {
    // If filter exists, it should NOT be the default one
    assertEquals(query.includes('lead:') && query.includes('isMe:'), false);
  }
});

Deno.test('projectsList - merges default filter with user filter using AND', async () => {
  const fixturePath = new URL(
    '../../tests/fixtures/projects-list.json',
    import.meta.url,
  ).pathname;
  const fixture = JSON.parse(await Deno.readTextFile(fixturePath));

  const client = new MockGraphQLClient(fixture);
  const userFilter = '{"state":{"eq":"started"}}';
  await projectsList(
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
  assertStringIncludes(query, 'lead:'); // from default filter
  assertStringIncludes(query, 'state:'); // from user filter
  assertStringIncludes(query, 'started'); // from user filter
});
