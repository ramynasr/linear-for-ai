import { assertEquals, assertStringIncludes } from '@std/assert';
import { projectsList, projectsShow } from '../../src/commands/projects.ts';
import { GraphQLClient } from '../../src/lib/graphql-client.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';

// Mock GraphQL client for testing
class MockGraphQLClient extends GraphQLClient {
  private mockResponse: unknown;

  constructor(mockResponse: unknown) {
    super('test_key');
    this.mockResponse = mockResponse;
  }

  override query<T>(): Promise<{ data: T }> {
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
      options: {},
    },
    { format: 'markdown' },
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
      options: {},
    },
    { format: 'json' },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.data.projects.nodes[0].name, 'Q1 Engineering Goals');
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
      options: {},
    },
    'project-id-123',
    { format: 'markdown' },
  );

  assertStringIncludes(result, '## Q1 Engineering Goals');
  assertStringIncludes(result, 'State:');
  assertStringIncludes(result, 'Progress:');
});
