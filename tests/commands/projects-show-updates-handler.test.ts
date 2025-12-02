import { assertEquals, assertStringIncludes } from '@std/assert';
import { showUpdates } from '../../src/commands/projects/show-updates/index.ts';
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

Deno.test('showUpdates - calculates default since date (14 days ago)', async () => {
  const mockResponse = {
    data: {
      projectUpdates: { nodes: [] },
      projects: {
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  await showUpdates(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: {},
      args: [],
    },
  );

  // Calculate expected date (14 days ago)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const expectedDate = fourteenDaysAgo.toISOString().split('T')[0];

  assertStringIncludes(
    client.lastQuery?.query || '',
    `gte: "${expectedDate}"`,
  );
});

Deno.test('showUpdates - uses provided since date', async () => {
  const mockResponse = {
    data: {
      projectUpdates: { nodes: [] },
      projects: {
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  await showUpdates(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { since: '2025-01-15' },
      args: [],
    },
  );

  assertStringIncludes(client.lastQuery?.query || '', 'gte: "2025-01-15"');
});

Deno.test('showUpdates - filters out empty projects', async () => {
  const mockResponse = {
    data: {
      projectUpdates: {
        nodes: [{
          id: '1',
          body: 'Update',
          createdAt: '2025-11-20T10:00:00Z',
          url: 'https://linear.app/team/update1',
          user: { id: '1', displayName: 'Alice' },
          project: {
            id: '1',
            name: 'Project with updates',
            url: 'https://linear.app/team/project1',
            state: 'started',
          },
        }],
      },
      projects: {
        nodes: [
          {
            id: '1',
            name: 'Project with updates',
            url: 'https://linear.app/team/project1',
            state: 'started',
            issues: { nodes: [] },
          },
          {
            id: '2',
            name: 'Empty project',
            url: 'https://linear.app/team/project2',
            state: 'planned',
            issues: { nodes: [] },
          },
          {
            id: '3',
            name: 'Project with issues',
            url: 'https://linear.app/team/project3',
            state: 'started',
            issues: {
              nodes: [{
                id: '1',
                identifier: 'ENG-123',
                title: 'Fix bug',
                url: 'https://linear.app/team/ENG-123',
                state: { id: '1', name: 'Done' },
              }],
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  const result = await showUpdates(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'markdown' },
      args: [],
    },
  );

  // Should include projects with updates or issues
  assertStringIncludes(result, 'Project with updates');
  assertStringIncludes(result, 'Project with issues');

  // Should NOT include empty project
  assertEquals(result.includes('Empty project'), false);

  // Should show 2 projects in header
  assertStringIncludes(result, '2 projects');
});

Deno.test('showUpdates - returns formatted markdown', async () => {
  const mockResponse = {
    data: {
      projectUpdates: {
        nodes: [{
          id: '1',
          body: 'Great progress',
          createdAt: '2025-11-20T10:00:00Z',
          url: 'https://linear.app/team/update1',
          user: { id: '1', displayName: 'Alice' },
          project: {
            id: '1',
            name: 'Q1 Goals',
            url: 'https://linear.app/team/project1',
            description: 'Q1 engineering goals',
            health: 'onTrack',
            targetDate: '2025-03-31',
            state: 'started',
            lead: {
              id: '1',
              displayName: 'Alice Johnson',
              email: 'alice@example.com',
            },
          },
        }],
      },
      projects: {
        nodes: [
          {
            id: '1',
            name: 'Q1 Goals',
            url: 'https://linear.app/team/project1',
            description: 'Q1 engineering goals',
            health: 'onTrack',
            targetDate: '2025-03-31',
            state: 'started',
            lead: {
              id: '1',
              displayName: 'Alice Johnson',
              email: 'alice@example.com',
            },
            issues: {
              nodes: [{
                id: '1',
                identifier: 'ENG-123',
                title: 'Fix bug',
                url: 'https://linear.app/team/ENG-123',
                state: { id: '1', name: 'Done' },
              }],
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  const result = await showUpdates(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'markdown' },
      args: [],
    },
  );

  assertStringIncludes(result, '# My Project Updates');
  assertStringIncludes(result, '## Q1 Goals');
  assertStringIncludes(result, 'Alice Johnson');
  assertStringIncludes(result, 'Great progress');
});

Deno.test('showUpdates - returns JSON format', async () => {
  const mockResponse = {
    data: {
      projectUpdates: {
        nodes: [{
          id: '1',
          body: 'Update',
          createdAt: '2025-11-20T10:00:00Z',
          url: 'https://linear.app/team/update1',
          user: { id: '1', displayName: 'Alice' },
          project: {
            id: '1',
            name: 'Q1 Goals',
            url: 'https://linear.app/team/project1',
            state: 'started',
          },
        }],
      },
      projects: {
        nodes: [
          {
            id: '1',
            name: 'Q1 Goals',
            url: 'https://linear.app/team/project1',
            state: 'started',
            issues: { nodes: [] },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  const result = await showUpdates(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { format: 'json' },
      args: [],
    },
  );

  const parsed = JSON.parse(result);
  assertEquals(parsed.projectCount, 1);
  assertEquals(parsed.projects[0].name, 'Q1 Goals');
});

Deno.test('showUpdates - passes showAllIssueUpdates to query', async () => {
  const mockResponse = {
    data: {
      projectUpdates: { nodes: [] },
      projects: {
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  await showUpdates(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { showAllIssueUpdates: true },
      args: [],
    },
  );

  // Should only have updatedAt filter, not completedAt
  const query = client.lastQuery?.query || '';
  assertStringIncludes(query, 'updatedAt:');
  assertEquals(query.includes('completedAt'), false);
});

Deno.test('showUpdates - passes pagination parameters', async () => {
  const mockResponse = {
    data: {
      projectUpdates: { nodes: [] },
      projects: {
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  await showUpdates(
    client,
    {
      config: DEFAULT_CONFIG,
      env: { apiKey: 'test' },
      options: { limit: 25, cursor: 'test-cursor' },
      args: [],
    },
  );

  assertStringIncludes(client.lastQuery?.query || '', 'first: 25');
  assertStringIncludes(client.lastQuery?.query || '', 'after: "test-cursor"');
});

Deno.test('showUpdates - throws error with multiple arguments', async () => {
  const mockResponse = {
    data: {
      projectUpdates: { nodes: [] },
      projects: {
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  const client = new MockGraphQLClient(mockResponse);
  const context = {
    args: ['project1', 'project2'],
    options: {},
    config: DEFAULT_CONFIG,
    env: { apiKey: 'test' },
  };

  try {
    await showUpdates(client, context);
    throw new Error('Expected error to be thrown');
  } catch (error) {
    assertStringIncludes(
      (error as Error).message,
      'Expected zero or one argument',
    );
  }
});

Deno.test('showUpdates - handles single project with idOrUrl', async () => {
  const mockData = {
    data: {
      projectUpdates: {
        nodes: [
          {
            id: 'update1',
            body: 'Weekly update',
            createdAt: '2025-01-15T10:00:00Z',
            url: 'https://linear.app/team/update1',
            user: { id: 'user1', displayName: 'John Doe' },
            project: {
              id: 'project1',
              name: 'Test Project',
              url: 'https://linear.app/team/project/test',
              state: 'started',
            },
          },
        ],
      },
      project: {
        id: 'project1',
        name: 'Test Project',
        url: 'https://linear.app/team/project/test',
        state: 'started',
        issues: {
          nodes: [],
        },
      },
    },
  };

  const client = new MockGraphQLClient(mockData);
  const context = {
    args: ['project1'],
    options: {},
    config: DEFAULT_CONFIG,
    env: { apiKey: 'test' },
  };

  const result = await showUpdates(client, context);
  assertStringIncludes(result, 'Test Project');
  assertStringIncludes(result, 'Weekly update');
});
