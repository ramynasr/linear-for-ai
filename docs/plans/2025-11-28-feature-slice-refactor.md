# Feature-Slice Structure Refactoring Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate flat command structure to feature-slice architecture for better organization and scalability.

**Architecture:** Transform current single-file-per-resource structure (`commands/projects.ts`) into feature-slice structure where each command lives in its own directory (`commands/projects/list/index.ts`, `commands/projects/list/query.ts`, `commands/projects/list/formatter.ts`). Extract shared utilities into `lib/utils/`.

**Tech Stack:** Deno, TypeScript

---

## Task 1: Create New Directory Structure

**Files:**

- Create: `src/lib/utils/.gitkeep`
- Create: `src/commands/issues/list/.gitkeep`
- Create: `src/commands/issues/show/.gitkeep`
- Create: `src/commands/projects/list/.gitkeep`
- Create: `src/commands/projects/show/.gitkeep`
- Create: `src/commands/teams/list/.gitkeep`
- Create: `src/commands/teams/show/.gitkeep`
- Create: `src/commands/notifications/list/.gitkeep`

**Step 1: Create directory structure**

```bash
mkdir -p src/lib/utils
mkdir -p src/commands/issues/{list,show}
mkdir -p src/commands/projects/{list,show}
mkdir -p src/commands/teams/{list,show}
mkdir -p src/commands/notifications/list
touch src/lib/utils/.gitkeep
touch src/commands/issues/list/.gitkeep
touch src/commands/issues/show/.gitkeep
touch src/commands/projects/list/.gitkeep
touch src/commands/projects/show/.gitkeep
touch src/commands/teams/list/.gitkeep
touch src/commands/teams/show/.gitkeep
touch src/commands/notifications/list/.gitkeep
```

**Step 2: Verify structure created**

Run: `ls -R src/commands/ src/lib/utils/`
Expected: New directory tree with .gitkeep files

**Step 3: Commit structure**

```bash
git add src/
git commit -m "refactor: create feature-slice directory structure"
```

---

## Task 2: Extract Shared Query Utilities

**Files:**

- Create: `src/lib/utils/query.ts`
- Read: `src/lib/queries/issues.ts` (for reference)
- Read: `src/lib/queries/projects.ts` (for reference)
- Test: `tests/lib/utils/query.test.ts`

**Step 1: Write test for buildFieldSelection utility**

Create `tests/lib/utils/query.test.ts`:

```typescript
import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { buildFieldSelection, buildPaginationParams } from '../../../src/lib/utils/query.ts';

Deno.test('buildFieldSelection - formats fields as newline-separated string', () => {
  const fields = ['id', 'title', 'state { name }'];
  const result = buildFieldSelection(fields);
  assertEquals(result, 'id\n    title\n    state { name }');
});

Deno.test('buildFieldSelection - handles single field', () => {
  const fields = ['id'];
  const result = buildFieldSelection(fields);
  assertEquals(result, 'id');
});

Deno.test('buildPaginationParams - builds params object', () => {
  const result = buildPaginationParams(50, 'cursor123');
  assertEquals(result, { first: 50, after: 'cursor123' });
});

Deno.test('buildPaginationParams - handles missing cursor', () => {
  const result = buildPaginationParams(25);
  assertEquals(result, { first: 25 });
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/utils/query.test.ts`
Expected: FAIL with "Module not found"

**Step 3: Extract shared utilities**

Create `src/lib/utils/query.ts`:

```typescript
/**
 * Shared utilities for building GraphQL queries
 */

/**
 * Format fields array as newline-separated string with indentation
 */
export function buildFieldSelection(fields: string[]): string {
  return fields.join('\n    ');
}

/**
 * Build pagination parameters object
 */
export function buildPaginationParams(
  limit: number,
  cursor?: string,
): Record<string, unknown> {
  const params: Record<string, unknown> = { first: limit };
  if (cursor) {
    params.after = cursor;
  }
  return params;
}

/**
 * Convert filter object to GraphQL input syntax
 */
export function buildFilterClause(filter?: Record<string, unknown>): string {
  if (!filter) return '';

  const { toGraphQLSyntax } = await import('../graphql-syntax.ts');
  return `, filter: ${toGraphQLSyntax(filter)}`;
}
```

**Step 4: Run tests to verify they pass**

Run: `deno test tests/lib/utils/query.test.ts`
Expected: All tests pass

**Step 5: Commit utilities**

```bash
git add src/lib/utils/query.ts tests/lib/utils/query.test.ts
git commit -m "refactor: extract shared query utilities"
```

---

## Task 3: Extract Shared Formatter Utilities

**Files:**

- Create: `src/lib/utils/formatter.ts`
- Read: `src/lib/formatters/markdown.ts` (existing utilities)
- Test: `tests/lib/utils/formatter.test.ts`

**Step 1: Write test for formatter utilities**

Create `tests/lib/utils/formatter.test.ts`:

```typescript
import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { formatEmptyResult, formatOutput } from '../../../src/lib/utils/formatter.ts';

Deno.test('formatOutput - returns markdown by default', () => {
  const data = { id: '123', name: 'Test' };
  const markdown = '**Test Data**';
  const result = formatOutput(data, 'markdown', markdown);
  assertEquals(result, markdown);
});

Deno.test('formatOutput - returns JSON when format is json', () => {
  const data = { id: '123', name: 'Test' };
  const result = formatOutput(data, 'json', 'markdown');
  assertEquals(result, JSON.stringify(data, null, 2));
});

Deno.test('formatEmptyResult - returns appropriate message', () => {
  const result = formatEmptyResult('projects');
  assertEquals(result, 'No projects found.');
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/utils/formatter.test.ts`
Expected: FAIL with "Module not found"

**Step 3: Create formatter utilities**

Create `src/lib/utils/formatter.ts`:

```typescript
/**
 * Shared utilities for formatting output
 */

/**
 * Format output based on requested format
 */
export function formatOutput(
  data: unknown,
  format: 'markdown' | 'json',
  markdownOutput: string,
): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  return markdownOutput;
}

/**
 * Format empty result message
 */
export function formatEmptyResult(resourceName: string): string {
  return `No ${resourceName} found.`;
}

/**
 * Format pagination info
 */
export function formatPaginationInfo(hasNextPage: boolean, endCursor?: string): string {
  if (!hasNextPage) return '';

  return `\n\nTo see more results, use: --cursor "${endCursor}"`;
}
```

**Step 4: Run tests to verify they pass**

Run: `deno test tests/lib/utils/formatter.test.ts`
Expected: All tests pass

**Step 5: Commit utilities**

```bash
git add src/lib/utils/formatter.ts tests/lib/utils/formatter.test.ts
git commit -m "refactor: extract shared formatter utilities"
```

---

## Task 4: Extract Shared Command Utilities

**Files:**

- Create: `src/lib/utils/command.ts`
- Test: `tests/lib/utils/command.test.ts`

**Step 1: Write test for command utilities**

Create `tests/lib/utils/command.test.ts`:

```typescript
import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { getFieldsOrDefault, parseFilter } from '../../../src/lib/utils/command.ts';

Deno.test('parseFilter - parses valid JSON filter', () => {
  const filter = '{"state":{"type":{"eq":"started"}}}';
  const result = parseFilter(filter);
  assertEquals(result, { state: { type: { eq: 'started' } } });
});

Deno.test('parseFilter - throws on invalid JSON', () => {
  const filter = '{invalid json}';
  assertThrows(
    () => parseFilter(filter),
    Error,
    'Invalid filter JSON',
  );
});

Deno.test('parseFilter - returns undefined when no filter', () => {
  const result = parseFilter(undefined);
  assertEquals(result, undefined);
});

Deno.test('getFieldsOrDefault - returns parsed fields from string', () => {
  const result = getFieldsOrDefault('id,title,state', ['id']);
  assertEquals(result, ['id', 'title', 'state']);
});

Deno.test('getFieldsOrDefault - returns default when no fields provided', () => {
  const result = getFieldsOrDefault(undefined, ['id', 'url']);
  assertEquals(result, ['id', 'url']);
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/utils/command.test.ts`
Expected: FAIL with "Module not found"

**Step 3: Create command utilities**

Create `src/lib/utils/command.ts`:

```typescript
/**
 * Shared utilities for command implementations
 */

/**
 * Parse filter JSON string
 */
export function parseFilter(filterString?: string): Record<string, unknown> | undefined {
  if (!filterString) return undefined;

  try {
    return JSON.parse(filterString);
  } catch (error) {
    throw new Error(`Invalid filter JSON: ${(error as Error).message}`);
  }
}

/**
 * Get fields from string or use defaults
 */
export function getFieldsOrDefault(
  fieldsString: string | undefined,
  defaultFields: string[],
): string[] {
  if (!fieldsString) return defaultFields;
  return fieldsString.split(',');
}
```

**Step 4: Run tests to verify they pass**

Run: `deno test tests/lib/utils/command.test.ts`
Expected: All tests pass

**Step 5: Commit utilities**

```bash
git add src/lib/utils/command.ts tests/lib/utils/command.test.ts
git commit -m "refactor: extract shared command utilities"
```

---

## Task 5: Migrate issues list Command

**Files:**

- Create: `src/commands/issues/list/index.ts`
- Create: `src/commands/issues/list/query.ts`
- Create: `src/commands/issues/list/formatter.ts`
- Read: `src/commands/issues.ts` (current implementation)
- Modify: `src/cli.ts` (update import)
- Test: `tests/commands/issues.test.ts` (verify no changes needed)

**Step 1: Create query builder**

Create `src/commands/issues/list/query.ts`:

```typescript
import {
  buildFieldSelection,
  buildFilterClause,
  buildPaginationParams,
} from '../../../lib/utils/query.ts';

export interface BuildQueryOptions {
  fields: string[];
  limit: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

export function buildQuery(options: BuildQueryOptions): string {
  const { fields, limit, cursor, filter } = options;
  const params = buildPaginationParams(limit, cursor);
  const filterClause = buildFilterClause(filter);

  return `
    query {
      issues(first: ${params.first}${cursor ? `, after: "${params.after}"` : ''}${filterClause}) {
        nodes {
          ${buildFieldSelection(fields)}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}
```

**Step 2: Create formatter**

Create `src/commands/issues/list/formatter.ts`:

```typescript
import type { LinearConnection, LinearIssue } from '../../../types/linear.ts';
import { formatIssuesList as formatMarkdown } from '../../../lib/formatters/issues.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatIssuesList(
  connection: LinearConnection<LinearIssue>,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(connection, 'markdown');
  return formatOutput(connection, format, markdownOutput);
}
```

**Step 3: Create command handler**

Create `src/commands/issues/list/index.ts`:

```typescript
import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection, LinearIssue } from '../../../types/linear.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatIssuesList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';

export async function list(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.issues,
  );
  const limit = options.limit || context.config.defaults.limit;
  const filter = parseFilter(options.filter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter });

  const response = await client.query<{ issues: LinearConnection<LinearIssue> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatIssuesList(response.data.issues, format);
}
```

**Step 4: Update CLI imports**

Modify `src/cli.ts` - find the line importing from `./commands/issues.ts` and update:

```typescript
// Old:
// import { issuesList, issuesShow } from './commands/issues.ts';

// New:
import { list as issuesList } from './commands/issues/list/index.ts';
import { issuesShow } from './commands/issues.ts'; // Keep show for now
```

**Step 5: Run all tests to verify no regressions**

Run: `deno test`
Expected: All 79 tests pass

**Step 6: Commit migration**

```bash
git add src/commands/issues/list/ src/cli.ts
git commit -m "refactor: migrate issues list to feature-slice structure"
```

---

## Task 6: Migrate issues show Command

**Files:**

- Create: `src/commands/issues/show/index.ts`
- Create: `src/commands/issues/show/query.ts`
- Create: `src/commands/issues/show/formatter.ts`
- Modify: `src/cli.ts` (update import)

**Step 1: Create query builder**

Create `src/commands/issues/show/query.ts`:

```typescript
import { buildFieldSelection } from '../../../lib/utils/query.ts';

export function buildQuery(identifier: string, fields: string[]): string {
  return `
    query {
      issue(id: "${identifier}") {
        ${buildFieldSelection(fields)}
      }
    }
  `;
}
```

**Step 2: Create formatter**

Create `src/commands/issues/show/formatter.ts`:

```typescript
import type { LinearIssue } from '../../../types/linear.ts';
import { formatIssueDetail as formatMarkdown } from '../../../lib/formatters/issues.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatIssueDetail(
  issue: LinearIssue,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(issue, 'markdown');
  return formatOutput(issue, format, markdownOutput);
}
```

**Step 3: Create command handler**

Create `src/commands/issues/show/index.ts`:

```typescript
import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearIssue } from '../../../types/linear.ts';
import type { CommandContext, ShowOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatIssueDetail } from './formatter.ts';
import { getFieldsOrDefault } from '../../../lib/utils/command.ts';

export async function show(
  client: GraphQLClient,
  context: CommandContext,
  identifier: string,
  options: ShowOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.issues,
  );

  const query = buildQuery(identifier, fields);

  const response = await client.query<{ issue: LinearIssue }>({ query });

  if (!response.data?.issue) {
    throw new Error(`Issue not found: ${identifier}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatIssueDetail(response.data.issue, format);
}
```

**Step 4: Update CLI imports**

Modify `src/cli.ts`:

```typescript
// Old:
// import { list as issuesList } from './commands/issues/list/index.ts';
// import { issuesShow } from './commands/issues.ts';

// New:
import { list as issuesList } from './commands/issues/list/index.ts';
import { show as issuesShow } from './commands/issues/show/index.ts';
```

**Step 5: Run all tests**

Run: `deno test`
Expected: All 79 tests pass

**Step 6: Commit migration**

```bash
git add src/commands/issues/show/ src/cli.ts
git commit -m "refactor: migrate issues show to feature-slice structure"
```

---

## Task 7: Migrate projects list Command

**Files:**

- Create: `src/commands/projects/list/index.ts`
- Create: `src/commands/projects/list/query.ts`
- Create: `src/commands/projects/list/formatter.ts`
- Modify: `src/cli.ts` (update import)

**Step 1: Create query builder**

Create `src/commands/projects/list/query.ts`:

```typescript
import {
  buildFieldSelection,
  buildFilterClause,
  buildPaginationParams,
} from '../../../lib/utils/query.ts';

export interface BuildQueryOptions {
  fields: string[];
  limit: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

export function buildQuery(options: BuildQueryOptions): string {
  const { fields, limit, cursor, filter } = options;
  const params = buildPaginationParams(limit, cursor);
  const filterClause = buildFilterClause(filter);

  return `
    query {
      projects(first: ${params.first}${cursor ? `, after: "${params.after}"` : ''}${filterClause}) {
        nodes {
          ${buildFieldSelection(fields)}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}
```

**Step 2: Create formatter**

Create `src/commands/projects/list/formatter.ts`:

```typescript
import type { LinearConnection, LinearProject } from '../../../types/linear.ts';
import { formatProjectsList as formatMarkdown } from '../../../lib/formatters/projects.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatProjectsList(
  connection: LinearConnection<LinearProject>,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(connection, 'markdown');
  return formatOutput(connection, format, markdownOutput);
}
```

**Step 3: Create command handler**

Create `src/commands/projects/list/index.ts`:

```typescript
import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection, LinearProject } from '../../../types/linear.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatProjectsList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';

export async function list(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields['projects list'],
  );
  const limit = options.limit || context.config.defaults.limit;
  const filter = parseFilter(options.filter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter });

  const response = await client.query<{ projects: LinearConnection<LinearProject> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatProjectsList(response.data.projects, format);
}
```

**Step 4: Update CLI imports**

Modify `src/cli.ts`:

```typescript
// Add:
import { list as projectsList } from './commands/projects/list/index.ts';
// Keep projectsShow from old file for now
```

**Step 5: Run all tests**

Run: `deno test`
Expected: All tests pass

**Step 6: Commit migration**

```bash
git add src/commands/projects/list/ src/cli.ts
git commit -m "refactor: migrate projects list to feature-slice structure"
```

---

## Task 8: Migrate projects show Command

**Files:**

- Create: `src/commands/projects/show/index.ts`
- Create: `src/commands/projects/show/query.ts`
- Create: `src/commands/projects/show/formatter.ts`
- Modify: `src/cli.ts`

**Step 1: Create query builder**

Create `src/commands/projects/show/query.ts`:

```typescript
import { buildFieldSelection } from '../../../lib/utils/query.ts';

export function buildQuery(id: string, fields: string[]): string {
  return `
    query {
      project(id: "${id}") {
        ${buildFieldSelection(fields)}
      }
    }
  `;
}
```

**Step 2: Create formatter**

Create `src/commands/projects/show/formatter.ts`:

```typescript
import type { LinearProject } from '../../../types/linear.ts';
import { formatProjectDetail as formatMarkdown } from '../../../lib/formatters/projects.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatProjectDetail(
  project: LinearProject,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(project, 'markdown');
  return formatOutput(project, format, markdownOutput);
}
```

**Step 3: Create command handler**

Create `src/commands/projects/show/index.ts`:

```typescript
import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearProject } from '../../../types/linear.ts';
import type { CommandContext, ShowOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatProjectDetail } from './formatter.ts';
import { getFieldsOrDefault } from '../../../lib/utils/command.ts';

export async function show(
  client: GraphQLClient,
  context: CommandContext,
  id: string,
  options: ShowOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.projects,
  );

  const query = buildQuery(id, fields);

  const response = await client.query<{ project: LinearProject }>({ query });

  if (!response.data?.project) {
    throw new Error(`Project not found: ${id}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatProjectDetail(response.data.project, format);
}
```

**Step 4: Update CLI imports**

Modify `src/cli.ts`:

```typescript
// Update:
import { list as projectsList } from './commands/projects/list/index.ts';
import { show as projectsShow } from './commands/projects/show/index.ts';
```

**Step 5: Run all tests**

Run: `deno test`
Expected: All tests pass

**Step 6: Commit migration**

```bash
git add src/commands/projects/show/ src/cli.ts
git commit -m "refactor: migrate projects show to feature-slice structure"
```

---

## Task 9: Migrate teams Commands

**Files:**

- Create: `src/commands/teams/list/index.ts`
- Create: `src/commands/teams/list/query.ts`
- Create: `src/commands/teams/list/formatter.ts`
- Create: `src/commands/teams/show/index.ts`
- Create: `src/commands/teams/show/query.ts`
- Create: `src/commands/teams/show/formatter.ts`
- Modify: `src/cli.ts`

**Step 1: Create teams list query**

Create `src/commands/teams/list/query.ts`:

```typescript
import {
  buildFieldSelection,
  buildFilterClause,
  buildPaginationParams,
} from '../../../lib/utils/query.ts';

export interface BuildQueryOptions {
  fields: string[];
  limit: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

export function buildQuery(options: BuildQueryOptions): string {
  const { fields, limit, cursor, filter } = options;
  const params = buildPaginationParams(limit, cursor);
  const filterClause = buildFilterClause(filter);

  return `
    query {
      teams(first: ${params.first}${cursor ? `, after: "${params.after}"` : ''}${filterClause}) {
        nodes {
          ${buildFieldSelection(fields)}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}
```

**Step 2: Create teams list formatter**

Create `src/commands/teams/list/formatter.ts`:

```typescript
import type { LinearConnection, LinearTeam } from '../../../types/linear.ts';
import { formatTeamsList as formatMarkdown } from '../../../lib/formatters/teams.ts';
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatTeamsList(
  connection: LinearConnection<LinearTeam>,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatMarkdown(connection, 'markdown');
  return formatOutput(connection, format, markdownOutput);
}
```

**Step 3: Create teams list handler**

Create `src/commands/teams/list/index.ts`:

```typescript
import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearConnection, LinearTeam } from '../../../types/linear.ts';
import type { CommandContext, ListOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatTeamsList } from './formatter.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';

export async function list(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.teams,
  );
  const limit = options.limit || context.config.defaults.limit;
  const filter = parseFilter(options.filter);

  const query = buildQuery({ fields, limit, cursor: options.cursor, filter });

  const response = await client.query<{ teams: LinearConnection<LinearTeam> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatTeamsList(response.data.teams, format);
}
```

**Step 4: Create teams show files** (query, formatter, handler - similar pattern)

Create `src/commands/teams/show/query.ts`, `formatter.ts`, `index.ts` following same pattern as issues/show.

**Step 5: Update CLI imports**

Modify `src/cli.ts`:

```typescript
import { list as teamsList } from './commands/teams/list/index.ts';
import { show as teamsShow } from './commands/teams/show/index.ts';
```

**Step 6: Run all tests**

Run: `deno test`
Expected: All tests pass

**Step 7: Commit migration**

```bash
git add src/commands/teams/ src/cli.ts
git commit -m "refactor: migrate teams commands to feature-slice structure"
```

---

## Task 10: Migrate notifications list Command

**Files:**

- Create: `src/commands/notifications/list/index.ts`
- Create: `src/commands/notifications/list/query.ts`
- Create: `src/commands/notifications/list/formatter.ts`
- Modify: `src/cli.ts`

**Step 1: Create notifications list query**

Create `src/commands/notifications/list/query.ts`:

```typescript
import {
  buildFieldSelection,
  buildFilterClause,
  buildPaginationParams,
} from '../../../lib/utils/query.ts';

export interface BuildQueryOptions {
  fields: string[];
  limit: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

export function buildQuery(options: BuildQueryOptions): string {
  const { fields, limit, cursor, filter } = options;
  const params = buildPaginationParams(limit, cursor);
  const filterClause = buildFilterClause(filter);

  return `
    query {
      notifications(first: ${params.first}${
    cursor ? `, after: "${params.after}"` : ''
  }${filterClause}) {
        nodes {
          ${buildFieldSelection(fields)}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}
```

**Step 2: Create formatter and handler** (following established pattern)

**Step 3: Update CLI imports**

Modify `src/cli.ts`:

```typescript
import { list as notificationsList } from './commands/notifications/list/index.ts';
```

**Step 4: Run all tests**

Run: `deno test`
Expected: All tests pass

**Step 5: Commit migration**

```bash
git add src/commands/notifications/ src/cli.ts
git commit -m "refactor: migrate notifications list to feature-slice structure"
```

---

## Task 11: Create Resource-Level Types Files

**Files:**

- Create: `src/commands/projects/types.ts`
- Create: `src/commands/issues/types.ts`

**Step 1: Create projects types**

Create `src/commands/projects/types.ts`:

```typescript
/**
 * Project command-specific types
 */

export interface ShowMyUpdatesOptions {
  since?: string;
  showAllIssueUpdates?: boolean;
  limit?: number;
  cursor?: string;
  format?: 'markdown' | 'json';
}
```

**Step 2: Create issues types**

Create `src/commands/issues/types.ts`:

```typescript
/**
 * Issue command-specific types
 *
 * Currently using shared types from ../types/cli.ts
 * Add command-specific types here as needed
 */
```

**Step 3: Commit types**

```bash
git add src/commands/*/types.ts
git commit -m "refactor: add resource-level type files"
```

---

## Task 12: Delete Old Command Files

**Files:**

- Delete: `src/commands/issues.ts`
- Delete: `src/commands/projects.ts`
- Delete: `src/commands/teams.ts`
- Delete: `src/commands/notifications.ts`
- Delete: `src/lib/queries/issues.ts`
- Delete: `src/lib/queries/projects.ts`
- Delete: `src/lib/queries/teams.ts`
- Delete: `src/lib/queries/notifications.ts`

**Step 1: Verify all imports updated**

Run: `grep -r "from './commands/issues.ts'" src/`
Expected: No matches

**Step 2: Run all tests to ensure nothing broken**

Run: `deno test`
Expected: All tests pass

**Step 3: Delete old files**

```bash
rm src/commands/issues.ts
rm src/commands/projects.ts
rm src/commands/teams.ts
rm src/commands/notifications.ts
rm src/lib/queries/issues.ts
rm src/lib/queries/projects.ts
rm src/lib/queries/teams.ts
rm src/lib/queries/notifications.ts
rm -rf src/lib/queries  # If directory empty
```

**Step 4: Run tests again**

Run: `deno test`
Expected: All tests pass

**Step 5: Commit deletion**

```bash
git add -A
git commit -m "refactor: remove old flat structure files"
```

---

## Task 13: Write Structure Documentation

**Files:**

- Create: `docs/architecture/structure.md`
- Modify: `CLAUDE.md` (add reference)

**Step 1: Create structure documentation**

Create `docs/architecture/structure.md`:

```markdown
# Project Structure

## Overview

This project uses a **feature-slice** architecture where each command is self-contained with its own query builder, formatter, and handler.

## Directory Organization

\`\`\`
src/
commands/
{resource}/
{action}/
index.ts # Command handler (exports main function)
query.ts # GraphQL query builder
formatter.ts # Output formatter (markdown/JSON)
types.ts # Resource-specific types
lib/
utils/
query.ts # Shared query utilities
formatter.ts # Shared formatter utilities
command.ts # Shared command utilities
graphql-client.ts
types/
linear.ts # Linear API types
cli.ts # Shared CLI types
\`\`\`

## File Placement Rules

### Where should code go?

**New command:** Create `src/commands/{resource}/{action}/`

**Command-specific logic:** In command's own directory

**Shared across one resource:** In `src/commands/{resource}/types.ts` or helper files

**Shared across all commands:** In `src/lib/utils/`

**API response types:** In `src/types/linear.ts`

**CLI interface types:** In `src/types/cli.ts`

## Command Structure Pattern

Each command follows this structure:

### index.ts (Handler)

- Exports main function (e.g., `list`, `show`)
- Parses options
- Calls query builder
- Calls API
- Calls formatter
- Returns formatted output

### query.ts (Query Builder)

- Exports `buildQuery()` function
- Takes structured options
- Returns GraphQL query string
- Uses shared utilities from `lib/utils/query.ts`

### formatter.ts (Formatter)

- Exports format function (e.g., `formatIssuesList`)
- Takes data and format type
- Returns markdown or JSON
- Uses shared utilities from `lib/utils/formatter.ts`

## Adding New Commands

1. Create directory: `src/commands/{resource}/{action}/`
2. Create `query.ts` with `buildQuery()` function
3. Create `formatter.ts` with format function
4. Create `index.ts` with exported handler
5. Update `src/cli.ts` to wire up routing
6. Add tests in `tests/commands/{resource}/{action}.test.ts`

## Shared Utilities

### lib/utils/query.ts

- `buildFieldSelection()` - Format fields array
- `buildPaginationParams()` - Build pagination object
- `buildFilterClause()` - Convert filter to GraphQL syntax

### lib/utils/formatter.ts

- `formatOutput()` - Route to markdown or JSON
- `formatEmptyResult()` - Format "no results" message
- `formatPaginationInfo()` - Format cursor info

### lib/utils/command.ts

- `parseFilter()` - Parse JSON filter string
- `getFieldsOrDefault()` - Get fields from string or defaults

## Benefits of This Structure

1. **Easy to locate code** - One command = one directory
2. **Self-contained** - All command code in one place
3. **Testable** - Each layer can be tested independently
4. **Scalable** - Adding commands doesn't bloat existing files
5. **Clear boundaries** - Shared vs. specific code is obvious
6. **Reduces conflicts** - Different features touch different files
```

**Step 2: Update CLAUDE.md reference**

Add to `CLAUDE.md` after "Package Structure" section:

```markdown
**Architecture:** See `./docs/architecture/structure.md` for detailed structure decisions and patterns.
```

**Step 3: Commit documentation**

```bash
git add docs/architecture/structure.md CLAUDE.md
git commit -m "docs: add structure documentation"
```

---

## Task 14: Final Verification

**Step 1: Run full test suite**

Run: `deno test`
Expected: All 79 tests pass

**Step 2: Run formatter**

Run: `deno fmt`
Expected: No changes

**Step 3: Run linter**

Run: `deno lint`
Expected: No errors

**Step 4: Manual smoke test**

If you have LINEAR_API_KEY set:

```bash
deno run --allow-all src/cli.ts issues list --help
```

Expected: Help text displays correctly

**Step 5: Create summary commit if needed**

If any fixes were made during verification:

```bash
git add -A
git commit -m "refactor: final cleanup and verification"
```

---

## Definition of Done

✅ All existing commands migrated to feature-slice structure
✅ All tests pass (79 tests, 0 failures)
✅ New structure documented in `docs/architecture/structure.md`
✅ `CLAUDE.md` updated with reference
✅ Old files deleted
✅ No regressions in functionality
✅ Code formatted and linted

## Next Steps

After this refactoring is complete and merged to trunk:

1. Create new worktree for `projects show-my-updates` feature
2. Implement following the established feature-slice pattern
3. Reference `docs/architecture/structure.md` for guidance
