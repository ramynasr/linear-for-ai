# Project Structure

## Overview

This project uses a **feature-slice** architecture where each command is self-contained with its own query builder, formatter, and handler. This design promotes code organization, scalability, and testability by keeping related functionality together.

## Directory Organization

```
src/
├── commands/
│   ├── issues/
│   │   ├── list/
│   │   │   ├── index.ts        # Command handler
│   │   │   ├── query.ts        # GraphQL query builder
│   │   │   └── formatter.ts    # Output formatter
│   │   ├── show/
│   │   │   ├── index.ts
│   │   │   ├── query.ts
│   │   │   └── formatter.ts
│   │   └── types.ts            # Issue-specific types
│   ├── projects/
│   │   ├── list/
│   │   ├── show/
│   │   └── types.ts
│   ├── teams/
│   │   ├── list/
│   │   ├── show/
│   │   └── types.ts
│   └── notifications/
│       └── list/
├── lib/
│   ├── utils/
│   │   ├── query.ts            # Shared query utilities
│   │   ├── formatter.ts        # Shared formatter utilities
│   │   └── command.ts          # Shared command utilities
│   ├── graphql-client.ts
│   └── formatters/
├── types/
│   ├── linear.ts               # Linear API types
│   └── cli.ts                  # Shared CLI types
└── cli.ts                      # Main entry point
```

## File Placement Rules

### Where should code go?

**New command:** Create `src/commands/{resource}/{action}/`

**Command-specific logic:** In command's own directory with three files:

- `index.ts` - Main handler function
- `query.ts` - GraphQL query builder
- `formatter.ts` - Output formatter

**Shared across one resource:** In `src/commands/{resource}/types.ts` or helper files in the resource directory

**Shared across all commands:** In `src/lib/utils/` with clear, focused utilities

**API response types:** In `src/types/linear.ts` for all Linear API types

**CLI interface types:** In `src/types/cli.ts` for command options and shared interfaces

## Command Structure Pattern

Each command follows this consistent three-part structure:

### index.ts (Handler)

Responsibility: Coordinate command execution

```typescript
export async function list(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  // 1. Parse and validate options
  const fields = getFieldsOrDefault(options.fields, context.config.defaults.fields.issues);
  const limit = options.limit || context.config.defaults.limit;
  const filter = parseFilter(options.filter);

  // 2. Build GraphQL query
  const query = buildQuery({ fields, limit, cursor: options.cursor, filter });

  // 3. Execute API call
  const response = await client.query<{ issues: LinearConnection<LinearIssue> }>({ query });

  // 4. Format and return output
  const format = options.format || context.config.defaults.format;
  return formatIssuesList(response.data.issues, format);
}
```

**Key responsibilities:**

- Parse command options using `lib/utils/command.ts` utilities
- Call query builder from `./query.ts`
- Execute GraphQL client
- Call formatter from `./formatter.ts`
- Return formatted string

### query.ts (Query Builder)

Responsibility: Build correct GraphQL query syntax

```typescript
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

**Key responsibilities:**

- Accept structured options
- Build valid GraphQL query string
- Use shared utilities from `lib/utils/query.ts` for field formatting and pagination
- Return clean query string suitable for API

### formatter.ts (Formatter)

Responsibility: Convert API response to user-facing output

```typescript
export function formatIssuesList(
  connection: LinearConnection<LinearIssue>,
  format: 'markdown' | 'json',
): string {
  const markdownOutput = formatIssuesList(connection, 'markdown');
  return formatOutput(connection, format, markdownOutput);
}
```

**Key responsibilities:**

- Accept API response data and format type
- Call resource-specific markdown formatter from `lib/formatters/`
- Use `formatOutput()` from `lib/utils/formatter.ts` to route to markdown or JSON
- Return final formatted string for user display

## Adding New Commands

To add a new command following the feature-slice pattern:

### Step 1: Create directory structure

```bash
mkdir -p src/commands/{resource}/{action}
```

### Step 2: Create query builder (query.ts)

Define a `BuildQueryOptions` interface with all needed parameters, then implement `buildQuery()` function that returns a GraphQL query string. Use shared utilities from `lib/utils/query.ts`:

```typescript
import {
  buildFieldSelection,
  buildFilterClause,
  buildPaginationParams,
} from '../../../lib/utils/query.ts';

export interface BuildQueryOptions {
  // Your options
}

export function buildQuery(options: BuildQueryOptions): string {
  // Build and return query
}
```

### Step 3: Create formatter (formatter.ts)

Export a format function that handles both markdown and JSON output:

```typescript
import { formatOutput } from '../../../lib/utils/formatter.ts';

export function formatResult(data: YourType, format: 'markdown' | 'json'): string {
  const markdownOutput = /* ... format as markdown ... */;
  return formatOutput(data, format, markdownOutput);
}
```

### Step 4: Create handler (index.ts)

Export the main command function (typically `list`, `show`, `create`, etc.):

```typescript
import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { CommandContext } from '../../../types/cli.ts';
import { getFieldsOrDefault, parseFilter } from '../../../lib/utils/command.ts';
import { buildQuery } from './query.ts';
import { formatResult } from './formatter.ts';

export async function list(
  client: GraphQLClient,
  context: CommandContext,
  options: YourOptions = {},
): Promise<string> {
  // Parse, build, execute, format, return
}
```

### Step 5: Wire up in CLI

Update `src/cli.ts` to import and route to your new command:

```typescript
import { list as resourceList } from './commands/{resource}/list/index.ts';

// In command routing:
case 'resource':
  return await resourceList(client, context, options);
```

### Step 6: Add tests

Create integration tests in `tests/commands/{resource}/` directory that verify the full command flow.

## Shared Utilities

### lib/utils/query.ts

Reusable GraphQL query building functions:

```typescript
buildFieldSelection(fields: string[]): string
```

Formats a fields array as a newline-separated string with proper indentation for GraphQL.

```typescript
buildPaginationParams(limit: number, cursor?: string): Record<string, unknown>
```

Builds pagination parameters object with `first` and optional `after` properties.

```typescript
buildFilterClause(filter?: Record<string, unknown>): string
```

Converts a filter object to GraphQL filter syntax, or returns empty string if no filter.

### lib/utils/formatter.ts

Reusable output formatting functions:

```typescript
formatOutput(data: unknown, format: 'markdown' | 'json', markdownOutput: string): string
```

Routes output to appropriate format. Returns `markdownOutput` for markdown format, or `JSON.stringify(data)` for JSON format.

```typescript
formatEmptyResult(resourceName: string): string
```

Returns a consistent "No {resource} found." message.

```typescript
formatPaginationInfo(hasNextPage: boolean, endCursor?: string): string
```

Returns pagination continuation instructions when there are more results.

### lib/utils/command.ts

Reusable command parsing functions:

```typescript
parseFilter(filterString?: string): Record<string, unknown> | undefined
```

Parses JSON-formatted filter string from CLI, throws with helpful error if invalid JSON.

```typescript
getFieldsOrDefault(fieldsString: string | undefined, defaultFields: string[]): string[]
```

Returns parsed fields from comma-separated string, or provided defaults if no fields specified.

## Benefits of This Structure

### 1. Easy to Locate Code

Each command is a self-contained unit. Looking for how `issues list` works? Go to `src/commands/issues/list/`. No hunting through monolithic files.

### 2. Self-Contained Commands

All code for one command lives in one place:

- `query.ts` - What to ask the API
- `formatter.ts` - How to display it
- `index.ts` - Orchestration logic

Changes to one command don't touch unrelated commands.

### 3. Independently Testable

Each layer can be tested in isolation:

- Test `query.ts` for correct GraphQL generation
- Test `formatter.ts` for correct output formatting
- Test `index.ts` for integration with mocked client

No need to mock the entire system to test one piece.

### 4. Scalable

Adding a new command requires creating just one new directory. The existing commands remain untouched. No growing monolithic files.

### 5. Clear Boundaries

It's obvious what's shared (`lib/utils/`) vs. command-specific (`src/commands/{resource}/{action}/`). New developers immediately understand where code should go.

### 6. Reduces File Conflicts

When multiple developers work on different commands, they touch completely different files. No merge conflicts from editing the same command file.

### 7. Consistent Patterns

Every command follows the same structure: query builder → handler → formatter. Developers new to the project can understand any command by looking at familiar patterns.

## Example: Adding "issues create" Command

To illustrate the pattern, here's what adding a create command would look like:

```
src/commands/issues/create/
├── index.ts
├── query.ts
└── formatter.ts
```

**query.ts** - Build mutation:

```typescript
export interface BuildQueryOptions {
  teamId: string;
  title: string;
  description?: string;
}

export function buildQuery(options: BuildQueryOptions): string {
  return `
    mutation {
      issueCreate(input: {
        teamId: "${options.teamId}"
        title: "${options.title}"
        description: "${options.description || ''}"
      }) {
        issue {
          id
          url
          title
        }
      }
    }
  `;
}
```

**formatter.ts** - Format response:

```typescript
export function formatIssueCreate(
  issue: LinearIssue,
  format: 'markdown' | 'json',
): string {
  const markdown = `Issue created: ${issue.title}\n${issue.url}`;
  return formatOutput(issue, format, markdown);
}
```

**index.ts** - Handler:

```typescript
export async function create(
  client: GraphQLClient,
  context: CommandContext,
  options: CreateOptions,
): Promise<string> {
  const query = buildQuery(options);
  const response = await client.query<{ issueCreate: { issue: LinearIssue } }>({ query });
  return formatIssueCreate(response.data.issueCreate.issue, options.format || 'markdown');
}
```

This new command automatically fits the established pattern with no changes to other commands.
