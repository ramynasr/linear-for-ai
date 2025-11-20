import { assertEquals, assertStringIncludes } from '@std/assert';
import { issuesList } from '../../src/commands/issues.ts';
import { GraphQLClient } from '../../src/lib/graphql-client.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';

// Mock GraphQL client for testing
class MockGraphQLClient extends GraphQLClient {
  private mockResponse: unknown;

  constructor(mockResponse: unknown) {
    super('test_key');
    this.mockResponse = mockResponse;
  }

  override async query<T>(): Promise<{ data: T }> {
    return this.mockResponse as { data: T };
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
  assertEquals(parsed.data.issues.nodes[0].identifier, 'ENG-123');
});
