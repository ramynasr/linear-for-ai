# Linear for AI - Deno Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Deno-based CLI tool that enables AI agents to interact with Linear's GraphQL API, producing a self-contained, portable executable for macOS.

**Architecture:** Deno provides native TypeScript support, built-in testing, and `deno compile` to create standalone executables. We'll use Deno's native HTTP client for GraphQL requests, implement a resource-based command structure with commander-like CLI parsing, and leverage Deno's built-in formatter for terminal output.

**Tech Stack:** Deno 2.x, TypeScript (strict mode), Linear GraphQL API, dotenv for config, native Deno testing

---

## Phase 1: Project Bootstrap

### Task 1: Initialize Deno Project

**Files:**
- Create: `deno.json`
- Create: `deno.lock`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`
- Create: `LICENSE`

**Step 1: Create deno.json configuration**

```json
{
  "name": "@ramynasr/linear-for-ai",
  "version": "0.1.0",
  "exports": "./src/cli.ts",
  "tasks": {
    "dev": "deno run --allow-net --allow-env --allow-read src/cli.ts",
    "test": "deno test --allow-net --allow-env --allow-read",
    "test:watch": "deno test --watch --allow-net --allow-env --allow-read",
    "compile": "deno compile --allow-net --allow-env --allow-read --output=dist/linear-for-ai src/cli.ts",
    "fmt": "deno fmt",
    "lint": "deno lint",
    "check": "deno check src/**/*.ts"
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 100,
    "indentWidth": 2,
    "singleQuote": true,
    "proseWrap": "preserve"
  },
  "lint": {
    "rules": {
      "tags": ["recommended"],
      "exclude": ["no-explicit-any"]
    }
  },
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "imports": {
    "@std/dotenv": "jsr:@std/dotenv@^0.225.0",
    "@std/path": "jsr:@std/path@^1.0.0",
    "@std/fs": "jsr:@std/fs@^1.0.0",
    "@std/cli": "jsr:@std/cli@^1.0.0",
    "@std/testing": "jsr:@std/testing@^1.0.0"
  }
}
```

**Step 2: Create .gitignore file**

```gitignore
# Deno
.deno/
deno.lock

# Environment
.env
*.local

# Build outputs
dist/
*.exe

# Internal docs (per CLAUDE.md)
internal-docs/

# Dependencies (if using npm modules)
node_modules/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/
```

**Step 3: Create .env.example**

```bash
# Linear API Configuration
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Custom config file path
# LINEAR_CONFIG=/custom/path/to/config.json

# Optional: Proxy configuration
# HTTPS_PROXY=http://proxy.example.com:8080
# HTTP_PROXY=http://proxy.example.com:8080
```

**Step 4: Create basic README.md**

```markdown
# linear-for-ai

CLI tool for AI agents to interact with Linear's GraphQL API.

## Installation

### From Source (Deno)

```bash
# Clone repository
git clone https://github.com/ramynasr/linear-for-ai.git
cd linear-for-ai

# Compile to standalone executable
deno task compile

# Binary available at: ./dist/linear-for-ai
```

## Configuration

Create `.env` file with your Linear API key:

```bash
LINEAR_API_KEY=your_api_key_here
```

Get your API key from Linear Settings → API → Personal API Keys.

## Usage

```bash
# List issues
linear-for-ai issues list

# Show specific issue
linear-for-ai issues show ENG-123

# List projects
linear-for-ai projects list
```

## Development

```bash
# Run in dev mode
deno task dev issues list

# Run tests
deno task test

# Format code
deno task fmt

# Lint code
deno task lint
```

## License

MIT
```

**Step 5: Create MIT LICENSE**

```
MIT License

Copyright (c) 2025 Ramy Nasr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Step 6: Initialize git lock file**

Run: `deno cache src/cli.ts` (will create after cli.ts exists)
Expected: Lock file generated

**Step 7: Commit**

```bash
git add deno.json .gitignore .env.example README.md LICENSE
git commit -m "feat: initialize Deno project structure"
```

---

### Task 2: Core Type Definitions

**Files:**
- Create: `src/types/linear.ts`
- Create: `src/types/config.ts`
- Create: `src/types/cli.ts`

**Step 1: Write Linear API type definitions (src/types/linear.ts)**

```typescript
/**
 * Linear GraphQL API type definitions
 */

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority: number;
  priorityLabel: string;
  state: LinearWorkflowState;
  assignee?: LinearUser;
  project?: LinearProject;
  cycle?: LinearCycle;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
  lead?: LinearUser;
  url: string;
}

export interface LinearTeam {
  id: string;
  key: string;
  name: string;
  description?: string;
  url: string;
}

export interface LinearCycle {
  id: string;
  number: number;
  name?: string;
  startsAt: string;
  endsAt: string;
  url: string;
}

export interface LinearWorkflowState {
  id: string;
  name: string;
  type: string;
  color: string;
}

export interface LinearUser {
  id: string;
  name: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export interface LinearPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface LinearConnection<T> {
  nodes: T[];
  pageInfo: LinearPageInfo;
}

export interface LinearError {
  message: string;
  extensions?: {
    code: string;
    [key: string]: unknown;
  };
}

export interface LinearResponse<T> {
  data?: T;
  errors?: LinearError[];
}
```

**Step 2: Write configuration type definitions (src/types/config.ts)**

```typescript
/**
 * Configuration and environment type definitions
 */

export interface Config {
  allowWrites: boolean;
  proxy: ProxyConfig;
  defaults: DefaultsConfig;
  cache: CacheConfig;
}

export interface ProxyConfig {
  enabled: boolean;
  url?: string;
}

export interface DefaultsConfig {
  format: OutputFormat;
  limit: number;
  fields: FieldsConfig;
}

export interface FieldsConfig {
  issues: string[];
  projects: string[];
  'projects list': string[];
  teams: string[];
  cycles: string[];
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
}

export type OutputFormat = 'markdown' | 'json';

export interface Environment {
  apiKey: string;
  configPath?: string;
  httpsProxy?: string;
  httpProxy?: string;
}

export const DEFAULT_CONFIG: Config = {
  allowWrites: false,
  proxy: {
    enabled: false,
  },
  defaults: {
    format: 'markdown',
    limit: 50,
    fields: {
      issues: ['id', 'identifier', 'title', 'state', 'assignee', 'priority', 'createdAt', 'url'],
      projects: ['id', 'name', 'progress', 'startDate', 'targetDate', 'url'],
      'projects list': ['id', 'name', 'url'],
      teams: ['id', 'key', 'name', 'url'],
      cycles: ['id', 'number', 'name', 'startsAt', 'endsAt', 'url'],
    },
  },
  cache: {
    enabled: true,
    ttl: 300,
  },
};
```

**Step 3: Write CLI type definitions (src/types/cli.ts)**

```typescript
/**
 * CLI command and option type definitions
 */

export interface GlobalOptions {
  format?: 'markdown' | 'json';
  debug?: boolean;
  config?: string;
  noColor?: boolean;
  fields?: string;
}

export interface ListOptions extends GlobalOptions {
  filter?: string;
  limit?: number;
  cursor?: string;
  fetchAll?: boolean;
}

export interface ShowOptions extends GlobalOptions {
  fields?: string;
}

export interface WriteOptions extends GlobalOptions {
  dryRun?: boolean;
  allowWrites?: boolean;
}

export interface CommandContext {
  config: Config;
  env: Environment;
  options: GlobalOptions;
}

export type CommandHandler<T = unknown> = (
  context: CommandContext,
  ...args: unknown[]
) => Promise<T>;
```

**Step 4: Create barrel export for types (src/types/mod.ts)**

```typescript
export * from './linear.ts';
export * from './config.ts';
export * from './cli.ts';
```

**Step 5: Verify types compile**

Run: `deno check src/types/mod.ts`
Expected: No errors

**Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add core type definitions"
```

---

### Task 3: Environment and Configuration Loading

**Files:**
- Create: `src/lib/env.ts`
- Create: `src/lib/config.ts`
- Create: `tests/lib/config.test.ts`

**Step 1: Write failing test for environment loading (tests/lib/env.test.ts)**

```typescript
import { assertEquals, assertExists } from '@std/testing/asserts';
import { loadEnvironment } from '../../src/lib/env.ts';

Deno.test('loadEnvironment - loads API key from environment', async () => {
  Deno.env.set('LINEAR_API_KEY', 'test_key_1234');
  const env = await loadEnvironment();
  assertEquals(env.apiKey, 'test_key_1234');
  Deno.env.delete('LINEAR_API_KEY');
});

Deno.test('loadEnvironment - throws when API key missing', async () => {
  Deno.env.delete('LINEAR_API_KEY');
  try {
    await loadEnvironment();
    throw new Error('Should have thrown');
  } catch (error) {
    assertExists(error);
    assertEquals(error.message, 'LINEAR_API_KEY environment variable is required');
  }
});

Deno.test('loadEnvironment - loads proxy configuration', async () => {
  Deno.env.set('LINEAR_API_KEY', 'test_key');
  Deno.env.set('HTTPS_PROXY', 'http://proxy.example.com:8080');
  const env = await loadEnvironment();
  assertEquals(env.httpsProxy, 'http://proxy.example.com:8080');
  Deno.env.delete('LINEAR_API_KEY');
  Deno.env.delete('HTTPS_PROXY');
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/env.test.ts`
Expected: FAIL with "module not found"

**Step 3: Implement environment loader (src/lib/env.ts)**

```typescript
import { load } from '@std/dotenv';
import type { Environment } from '../types/config.ts';

/**
 * Load environment variables from .env file and system environment
 */
export async function loadEnvironment(): Promise<Environment> {
  // Load .env file if it exists (doesn't throw if missing)
  await load({ export: true, envPath: '.env' });

  const apiKey = Deno.env.get('LINEAR_API_KEY');
  if (!apiKey) {
    throw new Error('LINEAR_API_KEY environment variable is required');
  }

  return {
    apiKey,
    configPath: Deno.env.get('LINEAR_CONFIG'),
    httpsProxy: Deno.env.get('HTTPS_PROXY'),
    httpProxy: Deno.env.get('HTTP_PROXY'),
  };
}

/**
 * Redact API key for debug output (show last 4 characters)
 */
export function redactApiKey(apiKey: string): string {
  if (apiKey.length <= 4) return '***';
  return `LINEAR_...${apiKey.slice(-4)}`;
}
```

**Step 4: Run test to verify it passes**

Run: `deno test tests/lib/env.test.ts`
Expected: PASS (all tests green)

**Step 5: Write failing test for config loading (tests/lib/config.test.ts)**

```typescript
import { assertEquals } from '@std/testing/asserts';
import { loadConfig, getConfigPath } from '../../src/lib/config.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';
import * as path from '@std/path';

Deno.test('getConfigPath - returns default path', () => {
  const configPath = getConfigPath();
  const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE');
  const expected = path.join(homeDir!, '.config', 'linear-for-ai', 'config.json');
  assertEquals(configPath, expected);
});

Deno.test('getConfigPath - returns custom path from environment', () => {
  Deno.env.set('LINEAR_CONFIG', '/custom/path/config.json');
  const configPath = getConfigPath();
  assertEquals(configPath, '/custom/path/config.json');
  Deno.env.delete('LINEAR_CONFIG');
});

Deno.test('loadConfig - returns default config when file not found', async () => {
  const config = await loadConfig('/nonexistent/config.json');
  assertEquals(config, DEFAULT_CONFIG);
});

Deno.test('loadConfig - merges user config with defaults', async () => {
  const testConfigPath = await Deno.makeTempFile({ suffix: '.json' });
  await Deno.writeTextFile(testConfigPath, JSON.stringify({
    allowWrites: true,
    defaults: { limit: 100 },
  }));

  const config = await loadConfig(testConfigPath);
  assertEquals(config.allowWrites, true);
  assertEquals(config.defaults.limit, 100);
  assertEquals(config.defaults.format, 'markdown'); // From defaults

  await Deno.remove(testConfigPath);
});
```

**Step 6: Run test to verify it fails**

Run: `deno test tests/lib/config.test.ts`
Expected: FAIL with "module not found"

**Step 7: Implement config loader (src/lib/config.ts)**

```typescript
import * as path from '@std/path';
import { exists } from '@std/fs';
import type { Config } from '../types/config.ts';
import { DEFAULT_CONFIG } from '../types/config.ts';

/**
 * Get the config file path from environment or default location
 */
export function getConfigPath(customPath?: string): string {
  if (customPath) return customPath;

  const envPath = Deno.env.get('LINEAR_CONFIG');
  if (envPath) return envPath;

  const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE');
  if (!homeDir) {
    throw new Error('Cannot determine home directory');
  }

  return path.join(homeDir, '.config', 'linear-for-ai', 'config.json');
}

/**
 * Deep merge two objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Load configuration from file or return defaults
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  const path = getConfigPath(configPath);

  try {
    const fileExists = await exists(path);
    if (!fileExists) {
      return DEFAULT_CONFIG;
    }

    const content = await Deno.readTextFile(path);
    const userConfig = JSON.parse(content) as Partial<Config>;

    return deepMerge(DEFAULT_CONFIG, userConfig);
  } catch (error) {
    console.error(`Warning: Failed to load config from ${path}: ${error.message}`);
    return DEFAULT_CONFIG;
  }
}
```

**Step 8: Run test to verify it passes**

Run: `deno test tests/lib/config.test.ts`
Expected: PASS (all tests green)

**Step 9: Commit**

```bash
git add src/lib/env.ts src/lib/config.ts tests/lib/
git commit -m "feat: add environment and config loading with tests"
```

---

## Phase 2: GraphQL Client Foundation

### Task 4: HTTP Client with GraphQL Support

**Files:**
- Create: `src/lib/graphql-client.ts`
- Create: `tests/lib/graphql-client.test.ts`

**Step 1: Write failing test for GraphQL client (tests/lib/graphql-client.test.ts)**

```typescript
import { assertEquals, assertExists } from '@std/testing/asserts';
import { GraphQLClient } from '../../src/lib/graphql-client.ts';

Deno.test('GraphQLClient - constructs with API key', () => {
  const client = new GraphQLClient('test_api_key');
  assertExists(client);
});

Deno.test('GraphQLClient - redacts API key in debug mode', () => {
  const client = new GraphQLClient('test_api_key_1234', { debug: true });
  const redacted = client.getRedactedKey();
  assertEquals(redacted, 'LINEAR_...1234');
});

Deno.test('GraphQLClient - constructs request headers', () => {
  const client = new GraphQLClient('test_key');
  const headers = client.getHeaders();
  assertEquals(headers.get('Authorization'), 'Bearer test_key');
  assertEquals(headers.get('Content-Type'), 'application/json');
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/graphql-client.test.ts`
Expected: FAIL with "module not found"

**Step 3: Implement GraphQL client base (src/lib/graphql-client.ts)**

```typescript
import { redactApiKey } from './env.ts';
import type { LinearResponse } from '../types/linear.ts';

export interface GraphQLClientOptions {
  debug?: boolean;
  proxy?: string;
}

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

export class GraphQLClient {
  private readonly apiKey: string;
  private readonly endpoint = 'https://api.linear.app/graphql';
  private readonly options: GraphQLClientOptions;

  constructor(apiKey: string, options: GraphQLClientOptions = {}) {
    this.apiKey = apiKey;
    this.options = options;
  }

  /**
   * Get redacted API key for debug output
   */
  getRedactedKey(): string {
    return redactApiKey(this.apiKey);
  }

  /**
   * Get request headers
   */
  getHeaders(): Headers {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${this.apiKey}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  }

  /**
   * Execute a GraphQL query
   */
  async query<T>(request: GraphQLRequest): Promise<LinearResponse<T>> {
    const startTime = Date.now();

    if (this.options.debug) {
      this.logRequest(request);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      const data = await response.json() as LinearResponse<T>;

      if (this.options.debug) {
        this.logResponse(data, Date.now() - startTime);
      }

      if (data.errors) {
        throw new GraphQLError(data.errors);
      }

      return data;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }
      throw new NetworkError(error.message);
    }
  }

  private logRequest(request: GraphQLRequest): void {
    console.error('\n[DEBUG] GraphQL Request');
    console.error(`POST ${this.endpoint}`);
    console.error('Headers:');
    console.error(`  Authorization: Bearer ${this.getRedactedKey()}`);
    console.error(`  Content-Type: application/json`);
    console.error('Body:');
    console.error(JSON.stringify(request, null, 2));
  }

  private logResponse(data: unknown, duration: number): void {
    console.error(`\n[DEBUG] GraphQL Response (${duration}ms)`);
    console.error('Body:');
    console.error(JSON.stringify(data, null, 2));
  }
}

export class GraphQLError extends Error {
  constructor(public errors: Array<{ message: string; extensions?: Record<string, unknown> }>) {
    super(errors.map((e) => e.message).join(', '));
    this.name = 'GraphQLError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

**Step 4: Run test to verify it passes**

Run: `deno test tests/lib/graphql-client.test.ts`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add src/lib/graphql-client.ts tests/lib/graphql-client.test.ts
git commit -m "feat: add GraphQL client with debug support"
```

---

### Task 5: Query Builder for Issues

**Files:**
- Create: `src/lib/queries/issues.ts`
- Create: `tests/lib/queries/issues.test.ts`

**Step 1: Write failing test for issues query builder (tests/lib/queries/issues.test.ts)**

```typescript
import { assertEquals, assertStringIncludes } from '@std/testing/asserts';
import { buildIssuesListQuery, buildIssueShowQuery } from '../../src/lib/queries/issues.ts';

Deno.test('buildIssuesListQuery - generates basic query', () => {
  const query = buildIssuesListQuery({});
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'issues');
  assertStringIncludes(query, 'nodes');
  assertStringIncludes(query, 'pageInfo');
});

Deno.test('buildIssuesListQuery - includes requested fields', () => {
  const query = buildIssuesListQuery({ fields: ['id', 'title', 'url'] });
  assertStringIncludes(query, 'id');
  assertStringIncludes(query, 'title');
  assertStringIncludes(query, 'url');
});

Deno.test('buildIssuesListQuery - includes pagination parameters', () => {
  const query = buildIssuesListQuery({ limit: 25, cursor: 'abc123' });
  assertStringIncludes(query, 'first: 25');
  assertStringIncludes(query, 'after: "abc123"');
});

Deno.test('buildIssueShowQuery - generates query with identifier', () => {
  const query = buildIssueShowQuery('ENG-123', ['id', 'title']);
  assertStringIncludes(query, 'query');
  assertStringIncludes(query, 'issue');
  assertStringIncludes(query, 'ENG-123');
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/queries/issues.test.ts`
Expected: FAIL with "module not found"

**Step 3: Implement issues query builder (src/lib/queries/issues.ts)**

```typescript
export interface IssuesListOptions {
  fields?: string[];
  limit?: number;
  cursor?: string;
  filter?: Record<string, unknown>;
}

/**
 * Build GraphQL query for listing issues
 */
export function buildIssuesListQuery(options: IssuesListOptions): string {
  const fields = options.fields || [
    'id',
    'identifier',
    'title',
    'url',
  ];

  const paginationArgs: string[] = [];
  if (options.limit) {
    paginationArgs.push(`first: ${options.limit}`);
  }
  if (options.cursor) {
    paginationArgs.push(`after: "${options.cursor}"`);
  }

  const filterArg = options.filter ? `, filter: ${JSON.stringify(options.filter)}` : '';
  const paginationStr = paginationArgs.length > 0 ? paginationArgs.join(', ') : '';

  return `
    query {
      issues(${paginationStr}${filterArg}) {
        nodes {
          ${buildFieldsString(fields)}
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;
}

/**
 * Build GraphQL query for showing a single issue
 */
export function buildIssueShowQuery(identifier: string, fields?: string[]): string {
  const fieldList = fields || [
    'id',
    'identifier',
    'title',
    'description',
    'priority',
    'priorityLabel',
    'createdAt',
    'updatedAt',
    'url',
  ];

  return `
    query {
      issue(id: "${identifier}") {
        ${buildFieldsString(fieldList)}
      }
    }
  `;
}

/**
 * Build nested field string with relations
 */
function buildFieldsString(fields: string[]): string {
  const simpleFields: string[] = [];
  const nestedFields: Record<string, string[]> = {};

  for (const field of fields) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!nestedFields[parent]) {
        nestedFields[parent] = [];
      }
      nestedFields[parent].push(child);
    } else {
      simpleFields.push(field);
    }
  }

  const result = [...simpleFields];

  for (const [parent, children] of Object.entries(nestedFields)) {
    result.push(`${parent} { ${children.join(' ')} }`);
  }

  return result.join('\n          ');
}
```

**Step 4: Run test to verify it passes**

Run: `deno test tests/lib/queries/issues.test.ts`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add src/lib/queries/issues.ts tests/lib/queries/issues.test.ts
git commit -m "feat: add issues query builder"
```

---

## Phase 3: Output Formatters

### Task 6: Markdown Table Formatter

**Files:**
- Create: `src/lib/formatters/markdown.ts`
- Create: `tests/lib/formatters/markdown.test.ts`

**Step 1: Write failing test for markdown formatter (tests/lib/formatters/markdown.test.ts)**

```typescript
import { assertEquals, assertStringIncludes } from '@std/testing/asserts';
import { formatTable, formatKeyValue, truncate } from '../../src/lib/formatters/markdown.ts';

Deno.test('truncate - truncates long strings', () => {
  const long = 'a'.repeat(300);
  const result = truncate(long, 250);
  assertEquals(result.length, 253); // 250 + "..."
  assertStringIncludes(result, '...');
});

Deno.test('truncate - preserves short strings', () => {
  const short = 'hello world';
  const result = truncate(short, 250);
  assertEquals(result, 'hello world');
});

Deno.test('formatTable - creates aligned table', () => {
  const headers = ['ID', 'Title', 'Status'];
  const rows = [
    ['ENG-1', 'Fix bug', 'Done'],
    ['ENG-2', 'Add feature', 'In Progress'],
  ];
  const result = formatTable(headers, rows);

  assertStringIncludes(result, 'ID');
  assertStringIncludes(result, 'Title');
  assertStringIncludes(result, 'Status');
  assertStringIncludes(result, 'ENG-1');
  assertStringIncludes(result, 'Fix bug');
  assertStringIncludes(result, '---');
});

Deno.test('formatKeyValue - creates key-value pairs', () => {
  const pairs = [
    ['Status', 'In Progress'],
    ['Assignee', '@alice'],
    ['Priority', 'High'],
  ];
  const result = formatKeyValue(pairs);

  assertStringIncludes(result, 'Status:');
  assertStringIncludes(result, 'In Progress');
  assertStringIncludes(result, 'Assignee:');
  assertStringIncludes(result, '@alice');
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/formatters/markdown.test.ts`
Expected: FAIL with "module not found"

**Step 3: Implement markdown formatter (src/lib/formatters/markdown.ts)**

```typescript
/**
 * Truncate string to max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Pad string to specified width
 */
function pad(str: string, width: number): string {
  if (str.length >= width) return str;
  return str + ' '.repeat(width - str.length);
}

/**
 * Calculate column widths based on content
 */
function calculateColumnWidths(headers: string[], rows: string[][]): number[] {
  const widths = headers.map((h) => h.length);

  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      widths[i] = Math.max(widths[i], row[i].length);
    }
  }

  return widths;
}

/**
 * Format data as markdown table with aligned columns
 */
export function formatTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return 'No results';
  }

  const widths = calculateColumnWidths(headers, rows);
  const lines: string[] = [];

  // Header row
  const headerRow = headers.map((h, i) => pad(h, widths[i])).join('  ');
  lines.push(headerRow);

  // Separator row
  const separator = widths.map((w) => '-'.repeat(w)).join('  ');
  lines.push(separator);

  // Data rows
  for (const row of rows) {
    const dataRow = row.map((cell, i) => pad(truncate(cell, 250), widths[i])).join('  ');
    lines.push(dataRow);
  }

  return lines.join('\n');
}

/**
 * Format data as key-value pairs
 */
export function formatKeyValue(pairs: Array<[string, string]>, indent = 0): string {
  const maxKeyLength = Math.max(...pairs.map(([key]) => key.length));
  const indentStr = ' '.repeat(indent);

  return pairs
    .map(([key, value]) => {
      const paddedKey = pad(key + ':', maxKeyLength + 1);
      return `${indentStr}${paddedKey} ${value}`;
    })
    .join('\n');
}

/**
 * Format section with header
 */
export function formatSection(title: string, content: string, level = 2): string {
  const heading = '#'.repeat(level);
  return `${heading} ${title}\n\n${content}`;
}
```

**Step 4: Run test to verify it passes**

Run: `deno test tests/lib/formatters/markdown.test.ts`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add src/lib/formatters/markdown.ts tests/lib/formatters/markdown.test.ts
git commit -m "feat: add markdown table formatter"
```

---

### Task 7: Issues List Formatter

**Files:**
- Create: `src/lib/formatters/issues.ts`
- Create: `tests/lib/formatters/issues.test.ts`

**Step 1: Write failing test for issues formatter (tests/lib/formatters/issues.test.ts)**

```typescript
import { assertEquals, assertStringIncludes } from '@std/testing/asserts';
import { formatIssuesList, formatIssueDetail } from '../../src/lib/formatters/issues.ts';
import type { LinearIssue, LinearConnection } from '../../src/types/linear.ts';

const mockIssue: LinearIssue = {
  id: '1',
  identifier: 'ENG-123',
  title: 'Fix login bug',
  priority: 1,
  priorityLabel: 'High',
  state: { id: '1', name: 'In Progress', type: 'started', color: '#f2c94c' },
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-17T15:30:00Z',
  url: 'https://linear.app/team/issue/ENG-123',
};

Deno.test('formatIssuesList - formats issues as markdown table', () => {
  const connection: LinearConnection<LinearIssue> = {
    nodes: [mockIssue],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatIssuesList(connection, 'markdown');
  assertStringIncludes(result, '## Issues');
  assertStringIncludes(result, 'ENG-123');
  assertStringIncludes(result, 'Fix login bug');
  assertStringIncludes(result, 'https://linear.app/team/issue/ENG-123');
});

Deno.test('formatIssuesList - formats as JSON', () => {
  const connection: LinearConnection<LinearIssue> = {
    nodes: [mockIssue],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatIssuesList(connection, 'json');
  const parsed = JSON.parse(result);
  assertEquals(parsed.data.issues.nodes[0].identifier, 'ENG-123');
});

Deno.test('formatIssueDetail - formats single issue', () => {
  const result = formatIssueDetail(mockIssue, 'markdown');
  assertStringIncludes(result, '## ENG-123');
  assertStringIncludes(result, 'Fix login bug');
  assertStringIncludes(result, 'Status:');
  assertStringIncludes(result, 'In Progress');
  assertStringIncludes(result, 'Priority:');
  assertStringIncludes(result, 'High');
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/formatters/issues.test.ts`
Expected: FAIL with "module not found"

**Step 3: Implement issues formatter (src/lib/formatters/issues.ts)**

```typescript
import type { LinearIssue, LinearConnection } from '../types/linear.ts';
import { formatTable, formatKeyValue, formatSection } from './markdown.ts';

/**
 * Format issues list for output
 */
export function formatIssuesList(
  connection: LinearConnection<LinearIssue>,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        issues: connection,
      },
    }, null, 2);
  }

  const { nodes, pageInfo } = connection;

  if (nodes.length === 0) {
    return '## Issues\n\nNo issues found.';
  }

  const headers = ['ID', 'Title', 'Status', 'Priority', 'URL'];
  const rows = nodes.map((issue) => [
    issue.identifier,
    issue.title,
    issue.state.name,
    issue.priorityLabel,
    issue.url,
  ]);

  const table = formatTable(headers, rows);
  const header = `## Issues (${nodes.length} result${nodes.length === 1 ? '' : 's'})`;

  let output = `${header}\n\n${table}`;

  if (pageInfo.hasNextPage) {
    output += `\n\nShowing ${nodes.length} results. Use --cursor=${pageInfo.endCursor} for next page.`;
  }

  return output;
}

/**
 * Format single issue detail for output
 */
export function formatIssueDetail(issue: LinearIssue, format: 'markdown' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify({
      data: {
        issue,
      },
    }, null, 2);
  }

  const pairs: Array<[string, string]> = [
    ['Status', issue.state.name],
    ['Priority', issue.priorityLabel],
    ['Created', new Date(issue.createdAt).toLocaleDateString()],
    ['Updated', new Date(issue.updatedAt).toLocaleDateString()],
    ['URL', issue.url],
  ];

  if (issue.assignee) {
    pairs.splice(2, 0, ['Assignee', `@${issue.assignee.displayName}`]);
  }

  const metadata = formatKeyValue(pairs);
  const header = `## ${issue.identifier}: ${issue.title}`;
  let output = `${header}\n\n${metadata}`;

  if (issue.description) {
    output += '\n\n' + formatSection('Description', issue.description, 3);
  }

  return output;
}
```

**Step 4: Run test to verify it passes**

Run: `deno test tests/lib/formatters/issues.test.ts`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add src/lib/formatters/issues.ts tests/lib/formatters/issues.test.ts
git commit -m "feat: add issues list and detail formatters"
```

---

## Phase 4: CLI Command Structure

### Task 8: CLI Argument Parser

**Files:**
- Create: `src/lib/cli-parser.ts`
- Create: `tests/lib/cli-parser.test.ts`

**Step 1: Write failing test for CLI parser (tests/lib/cli-parser.test.ts)**

```typescript
import { assertEquals } from '@std/testing/asserts';
import { parseArgs, type ParsedCommand } from '../../src/lib/cli-parser.ts';

Deno.test('parseArgs - parses issues list command', () => {
  const result = parseArgs(['issues', 'list', '--limit', '25']);
  assertEquals(result.resource, 'issues');
  assertEquals(result.action, 'list');
  assertEquals(result.options.limit, 25);
});

Deno.test('parseArgs - parses issues show command', () => {
  const result = parseArgs(['issues', 'show', 'ENG-123']);
  assertEquals(result.resource, 'issues');
  assertEquals(result.action, 'show');
  assertEquals(result.args[0], 'ENG-123');
});

Deno.test('parseArgs - parses global options', () => {
  const result = parseArgs(['--format', 'json', '--debug', 'issues', 'list']);
  assertEquals(result.options.format, 'json');
  assertEquals(result.options.debug, true);
});

Deno.test('parseArgs - handles help flag', () => {
  const result = parseArgs(['--help']);
  assertEquals(result.showHelp, true);
});
```

**Step 2: Run test to verify it fails**

Run: `deno test tests/lib/cli-parser.test.ts`
Expected: FAIL with "module not found"

**Step 3: Implement CLI parser (src/lib/cli-parser.ts)**

```typescript
import { parseArgs as denoParseArgs } from '@std/cli';
import type { GlobalOptions } from '../types/cli.ts';

export interface ParsedCommand {
  resource?: string;
  action?: string;
  args: string[];
  options: GlobalOptions & Record<string, unknown>;
  showHelp?: boolean;
  showVersion?: boolean;
}

/**
 * Parse command line arguments
 */
export function parseArgs(args: string[]): ParsedCommand {
  const parsed = denoParseArgs(args, {
    boolean: ['help', 'version', 'debug', 'no-color', 'dry-run', 'allow-writes', 'fetch-all'],
    string: ['format', 'config', 'filter', 'fields', 'cursor'],
    number: ['limit'],
    alias: {
      h: 'help',
      v: 'version',
      f: 'format',
      d: 'debug',
    },
    '--': true,
  });

  const resource = parsed._[0]?.toString();
  const action = parsed._[1]?.toString();
  const commandArgs = parsed._.slice(2).map((a) => a.toString());

  return {
    resource,
    action,
    args: commandArgs,
    options: {
      format: parsed.format as 'markdown' | 'json' | undefined,
      debug: parsed.debug,
      config: parsed.config,
      noColor: parsed['no-color'],
      fields: parsed.fields,
      limit: parsed.limit,
      cursor: parsed.cursor,
      filter: parsed.filter,
      dryRun: parsed['dry-run'],
      allowWrites: parsed['allow-writes'],
      fetchAll: parsed['fetch-all'],
    },
    showHelp: parsed.help || (!resource && !parsed.version),
    showVersion: parsed.version,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `deno test tests/lib/cli-parser.test.ts`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add src/lib/cli-parser.ts tests/lib/cli-parser.test.ts
git commit -m "feat: add CLI argument parser"
```

---

### Task 9: Issues Commands Implementation

**Files:**
- Create: `src/commands/issues.ts`
- Create: `tests/commands/issues.test.ts`

**Step 1: Write test fixture for API responses (tests/fixtures/issues-list.json)**

```json
{
  "data": {
    "issues": {
      "nodes": [
        {
          "id": "1",
          "identifier": "ENG-123",
          "title": "Fix login bug",
          "priority": 1,
          "priorityLabel": "High",
          "state": {
            "id": "1",
            "name": "In Progress",
            "type": "started",
            "color": "#f2c94c"
          },
          "createdAt": "2025-01-15T10:00:00Z",
          "updatedAt": "2025-01-17T15:30:00Z",
          "url": "https://linear.app/team/issue/ENG-123"
        }
      ],
      "pageInfo": {
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": null,
        "endCursor": null
      }
    }
  }
}
```

**Step 2: Write failing test for issues commands (tests/commands/issues.test.ts)**

```typescript
import { assertEquals, assertStringIncludes } from '@std/testing/asserts';
import { issuesList, issuesShow } from '../../src/commands/issues.ts';
import { GraphQLClient } from '../../src/lib/graphql-client.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';

// Mock GraphQL client for testing
class MockGraphQLClient extends GraphQLClient {
  private mockResponse: unknown;

  constructor(mockResponse: unknown) {
    super('test_key');
    this.mockResponse = mockResponse;
  }

  async query<T>(): Promise<{ data: T }> {
    return this.mockResponse as { data: T };
  }
}

Deno.test('issuesList - returns formatted markdown', async () => {
  const fixture = JSON.parse(
    await Deno.readTextFile('./tests/fixtures/issues-list.json'),
  );

  const client = new MockGraphQLClient(fixture);
  const result = await issuesList(client, {
    config: DEFAULT_CONFIG,
    options: { format: 'markdown' },
  });

  assertStringIncludes(result, '## Issues');
  assertStringIncludes(result, 'ENG-123');
  assertStringIncludes(result, 'Fix login bug');
});

Deno.test('issuesList - returns JSON format', async () => {
  const fixture = JSON.parse(
    await Deno.readTextFile('./tests/fixtures/issues-list.json'),
  );

  const client = new MockGraphQLClient(fixture);
  const result = await issuesList(client, {
    config: DEFAULT_CONFIG,
    options: { format: 'json' },
  });

  const parsed = JSON.parse(result);
  assertEquals(parsed.data.issues.nodes[0].identifier, 'ENG-123');
});
```

**Step 3: Run test to verify it fails**

Run: `deno test tests/commands/issues.test.ts`
Expected: FAIL with "module not found"

**Step 4: Implement issues commands (src/commands/issues.ts)**

```typescript
import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { LinearConnection, LinearIssue } from '../types/linear.ts';
import type { CommandContext, ListOptions, ShowOptions } from '../types/cli.ts';
import { buildIssuesListQuery, buildIssueShowQuery } from '../lib/queries/issues.ts';
import { formatIssuesList, formatIssueDetail } from '../lib/formatters/issues.ts';

/**
 * List issues command
 */
export async function issuesList(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.issues;
  const limit = options.limit || context.config.defaults.limit;

  const query = buildIssuesListQuery({
    fields,
    limit,
    cursor: options.cursor,
  });

  const response = await client.query<{ issues: LinearConnection<LinearIssue> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatIssuesList(response.data.issues, format);
}

/**
 * Show issue detail command
 */
export async function issuesShow(
  client: GraphQLClient,
  context: CommandContext,
  identifier: string,
  options: ShowOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.issues;

  const query = buildIssueShowQuery(identifier, fields);

  const response = await client.query<{ issue: LinearIssue }>({
    query,
  });

  if (!response.data?.issue) {
    throw new Error(`Issue not found: ${identifier}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatIssueDetail(response.data.issue, format);
}
```

**Step 5: Run test to verify it passes**

Run: `deno test tests/commands/issues.test.ts`
Expected: PASS (all tests green)

**Step 6: Commit**

```bash
git add src/commands/issues.ts tests/commands/issues.test.ts tests/fixtures/
git commit -m "feat: implement issues list and show commands"
```

---

### Task 10: Main CLI Entry Point

**Files:**
- Create: `src/cli.ts`
- Create: `src/lib/help.ts`

**Step 1: Implement help text (src/lib/help.ts)**

```typescript
export const HELP_TEXT = `
linear-for-ai - CLI tool for AI agents to interact with Linear

USAGE:
  linear-for-ai <resource> <action> [options]

RESOURCES:
  issues      Manage and query issues
  projects    Manage and query projects
  teams       View team information
  cycles      View cycle information

COMMON COMMANDS:
  linear-for-ai issues list [--filter <filter>] [--limit N]
  linear-for-ai issues show <id>
  linear-for-ai projects list
  linear-for-ai projects show <id>
  linear-for-ai teams list

GLOBAL OPTIONS:
  --format <markdown|json>  Output format (default: markdown)
  --debug                   Show debug information
  --config <path>           Custom config file path
  --no-color                Disable ANSI colors
  --fields <fields>         Override default field selection
  -h, --help               Show this help message
  -v, --version            Show version information

EXAMPLES:
  # List issues in progress
  linear-for-ai issues list --filter 'status:in_progress'

  # Show issue detail
  linear-for-ai issues show ENG-123

  # List all projects in JSON format
  linear-for-ai projects list --format json

CONFIGURATION:
  Set LINEAR_API_KEY environment variable or create .env file.
  Config file: ~/.config/linear-for-ai/config.json

For more information: https://github.com/ramynasr/linear-for-ai
`;

export const VERSION = '0.1.0';
```

**Step 2: Implement main CLI (src/cli.ts)**

```typescript
#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

import { parseArgs } from './lib/cli-parser.ts';
import { loadEnvironment } from './lib/env.ts';
import { loadConfig } from './lib/config.ts';
import { GraphQLClient } from './lib/graphql-client.ts';
import { issuesList, issuesShow } from './commands/issues.ts';
import { HELP_TEXT, VERSION } from './lib/help.ts';
import type { CommandContext } from './types/cli.ts';

async function main() {
  const parsed = parseArgs(Deno.args);

  // Show help
  if (parsed.showHelp) {
    console.log(HELP_TEXT);
    Deno.exit(0);
  }

  // Show version
  if (parsed.showVersion) {
    console.log(`linear-for-ai v${VERSION}`);
    Deno.exit(0);
  }

  try {
    // Load environment and config
    const env = await loadEnvironment();
    const config = await loadConfig(parsed.options.config);

    // Create GraphQL client
    const client = new GraphQLClient(env.apiKey, {
      debug: parsed.options.debug,
      proxy: env.httpsProxy || env.httpProxy,
    });

    // Build command context
    const context: CommandContext = {
      config,
      env,
      options: parsed.options,
    };

    // Route to command handler
    let output: string;

    if (parsed.resource === 'issues') {
      if (parsed.action === 'list') {
        output = await issuesList(client, context, parsed.options);
      } else if (parsed.action === 'show') {
        if (!parsed.args[0]) {
          throw new Error('Issue identifier required for show command');
        }
        output = await issuesShow(client, context, parsed.args[0], parsed.options);
      } else {
        throw new Error(`Unknown action for issues: ${parsed.action}`);
      }
    } else {
      throw new Error(`Unknown resource: ${parsed.resource}`);
    }

    // Output result
    console.log(output);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (parsed.options.debug) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
```

**Step 3: Make CLI executable**

Run: `chmod +x src/cli.ts`
Expected: File is executable

**Step 4: Test CLI manually**

Set up test environment:
```bash
echo "LINEAR_API_KEY=test_key" > .env
```

Run: `deno task dev --help`
Expected: Help text displayed

Run: `deno task dev --version`
Expected: Version displayed

**Step 5: Commit**

```bash
git add src/cli.ts src/lib/help.ts
git commit -m "feat: implement main CLI entry point with help and version"
```

---

## Phase 5: Build and Distribution

### Task 11: Compile Standalone Executable

**Files:**
- Modify: `README.md`
- Create: `scripts/build.sh`

**Step 1: Create build script (scripts/build.sh)**

```bash
#!/bin/bash
set -e

echo "Building linear-for-ai..."

# Clean dist directory
rm -rf dist
mkdir -p dist

# Compile for macOS (current platform)
echo "Compiling for macOS..."
deno compile \
  --allow-net \
  --allow-env \
  --allow-read \
  --output=dist/linear-for-ai \
  src/cli.ts

echo ""
echo "Build complete!"
echo "Executable: ./dist/linear-for-ai"
echo ""
echo "Test with:"
echo "  ./dist/linear-for-ai --version"
echo "  ./dist/linear-for-ai --help"
```

**Step 2: Make build script executable**

Run: `chmod +x scripts/build.sh`
Expected: Script is executable

**Step 3: Run build**

Run: `./scripts/build.sh`
Expected: Executable created at `./dist/linear-for-ai`

**Step 4: Test compiled executable**

Run: `./dist/linear-for-ai --version`
Expected: Version displayed

Run: `./dist/linear-for-ai --help`
Expected: Help text displayed

**Step 5: Update README with build instructions**

Update the Installation section in README.md to include detailed build steps and usage examples.

**Step 6: Commit**

```bash
git add scripts/build.sh README.md
git commit -m "feat: add build script for standalone executable"
```

---

### Task 12: Integration Testing

**Files:**
- Create: `tests/integration/cli.test.ts`
- Create: `.github/workflows/test.yml` (if using CI)

**Step 1: Write integration test (tests/integration/cli.test.ts)**

```typescript
import { assertEquals } from '@std/testing/asserts';

Deno.test('CLI - shows help with --help flag', async () => {
  const command = new Deno.Command('deno', {
    args: ['run', '--allow-net', '--allow-env', '--allow-read', 'src/cli.ts', '--help'],
  });

  const { code, stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  assertEquals(output.includes('linear-for-ai'), true);
  assertEquals(output.includes('USAGE:'), true);
});

Deno.test('CLI - shows version with --version flag', async () => {
  const command = new Deno.Command('deno', {
    args: ['run', '--allow-net', '--allow-env', '--allow-read', 'src/cli.ts', '--version'],
  });

  const { code, stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  assertEquals(output.includes('linear-for-ai v'), true);
});

Deno.test('CLI - errors without API key', async () => {
  const command = new Deno.Command('deno', {
    args: ['run', '--allow-net', '--allow-env', '--allow-read', 'src/cli.ts', 'issues', 'list'],
    env: { LINEAR_API_KEY: '' },
    clearEnv: true,
  });

  const { code, stderr } = await command.output();
  const output = new TextDecoder().decode(stderr);

  assertEquals(code, 1);
  assertEquals(output.includes('LINEAR_API_KEY'), true);
});
```

**Step 2: Run integration tests**

Run: `deno test tests/integration/`
Expected: All tests pass

**Step 3: Commit**

```bash
git add tests/integration/
git commit -m "test: add integration tests for CLI"
```

---

## Phase 6: Documentation and Polish

### Task 13: Create Example Configuration

**Files:**
- Create: `docs/configuration.md`
- Create: `config.example.json`

**Step 1: Create example config file (config.example.json)**

```json
{
  "allowWrites": false,
  "proxy": {
    "enabled": false,
    "url": "http://proxy.example.com:8080"
  },
  "defaults": {
    "format": "markdown",
    "limit": 50,
    "fields": {
      "issues": [
        "id",
        "identifier",
        "title",
        "state.name",
        "assignee.displayName",
        "priority",
        "priorityLabel",
        "createdAt",
        "url"
      ],
      "projects": [
        "id",
        "name",
        "progress",
        "state",
        "startDate",
        "targetDate",
        "lead.displayName",
        "url"
      ],
      "projects list": [
        "id",
        "name",
        "url"
      ]
    }
  },
  "cache": {
    "enabled": true,
    "ttl": 300
  }
}
```

**Step 2: Create configuration documentation (docs/configuration.md)**

```markdown
# Configuration Guide

## Environment Variables

Create a `.env` file in your project root or set environment variables:

```bash
# Required
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
LINEAR_CONFIG=/custom/path/to/config.json
HTTPS_PROXY=http://proxy.example.com:8080
HTTP_PROXY=http://proxy.example.com:8080
```

## Configuration File

Default location: `~/.config/linear-for-ai/config.json`

See `config.example.json` for full example.

### Key Settings

**allowWrites** (boolean, default: false)
- Must be `true` to execute write operations with `--allow-writes` flag

**defaults.format** (string, default: "markdown")
- Default output format: "markdown" or "json"

**defaults.limit** (number, default: 50)
- Default pagination limit for list commands

**defaults.fields** (object)
- Default field selections for each resource type
- Use dot notation for nested fields: "assignee.displayName"

## Field Selection

Override defaults with `--fields` flag:

```bash
linear-for-ai issues list --fields id,title,url
linear-for-ai issues show ENG-123 --fields id,title,description,state.name
```

## Proxy Configuration

Two ways to configure proxy:

1. Environment variables (applies to all requests):
```bash
export HTTPS_PROXY=http://proxy.example.com:8080
```

2. Config file (takes precedence):
```json
{
  "proxy": {
    "enabled": true,
    "url": "http://proxy.example.com:8080"
  }
}
```
```

**Step 3: Commit**

```bash
git add config.example.json docs/configuration.md
git commit -m "docs: add configuration guide and example"
```

---

### Task 14: Update Project README

**Files:**
- Modify: `README.md`

**Step 1: Expand README with comprehensive documentation**

Add sections for:
- Detailed installation instructions
- Configuration setup steps
- Complete command reference
- Usage examples
- Development workflow
- Contributing guidelines
- Troubleshooting

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: expand README with comprehensive documentation"
```

---

## Phase 7: Additional Resources (Projects, Teams)

### Task 15: Projects Commands

**Files:**
- Create: `src/lib/queries/projects.ts`
- Create: `src/lib/formatters/projects.ts`
- Create: `src/commands/projects.ts`
- Create: `tests/commands/projects.test.ts`

**Follow same pattern as Issues commands:**

1. Write failing tests
2. Implement query builders
3. Implement formatters
4. Implement command handlers
5. Update CLI router in `src/cli.ts`
6. Verify tests pass
7. Commit

**GraphQL queries needed:**
- `buildProjectsListQuery()` - List all projects
- `buildProjectShowQuery()` - Show single project
- `buildProjectIssuesQuery()` - List issues in project

---

### Task 16: Teams Commands

**Files:**
- Create: `src/lib/queries/teams.ts`
- Create: `src/lib/formatters/teams.ts`
- Create: `src/commands/teams.ts`
- Create: `tests/commands/teams.test.ts`

**Follow same pattern as Issues commands**

**GraphQL queries needed:**
- `buildTeamsListQuery()` - List all teams
- `buildTeamShowQuery()` - Show single team

---

## Execution Handoff

Plan complete and saved to `docs/plans/2025-11-19-deno-foundation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration with quality gates

**2. Parallel Session (separate)** - Open new session with superpowers:executing-plans in this directory, batch execution with review checkpoints

**Which approach would you like?**
