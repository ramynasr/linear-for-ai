# Phase 2: Read Operations - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement read-only operations for issues, projects, cycles, and teams with markdown and JSON output formatting, pagination support, and basic filtering.

**Architecture:** Build formatters for markdown (terminal-optimized with headers and tables) and JSON output. Implement command handlers that use Linear SDK to fetch data, format output, and handle pagination. Support --limit, --cursor, and --fetch-all flags.

**Tech Stack:** @linear/sdk for API calls, existing LinearClient wrapper, markdown formatting with headers and ASCII tables, JSON.stringify for JSON output.

---

## Task 1: Output Formatters

**Files:**
- Create: `packages/cli/src/lib/formatters/types.ts`
- Create: `packages/cli/src/lib/formatters/markdown.ts`
- Create: `packages/cli/src/lib/formatters/json.ts`
- Create: `packages/cli/src/lib/formatters/index.ts`

**Step 1: Define formatter types**

Create `packages/cli/src/lib/formatters/types.ts`:
```typescript
export interface Issue {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  priority?: string;
  createdAt: string;
  updatedAt?: string;
  url: string;
  description?: string;
  project?: string;
  cycle?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
  url: string;
}

export interface Cycle {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  progress: number;
  url: string;
}

export interface Team {
  id: string;
  name: string;
  key: string;
  description?: string;
}

export interface PaginationInfo {
  hasNextPage: boolean;
  endCursor?: string;
  totalCount?: number;
}

export interface ListResult<T> {
  items: T[];
  pagination?: PaginationInfo;
}
```

**Step 2: Implement markdown formatter**

Create `packages/cli/src/lib/formatters/markdown.ts`:
```typescript
import { Issue, Project, Cycle, Team, ListResult } from './types.js';

export class MarkdownFormatter {
  static formatIssueList(result: ListResult<Issue>): string {
    const lines: string[] = [];

    lines.push(`## Issues (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No issues found.');
      return lines.join('\n');
    }

    // Table header
    lines.push('ID        Title              Status        Assignee  Priority  URL');
    lines.push('--------  -----------------  ------------  --------  --------  -----------------------------------------');

    // Table rows
    result.items.forEach(issue => {
      const id = this.truncate(issue.id, 8);
      const title = this.truncate(issue.title, 17);
      const status = this.truncate(issue.status, 12);
      const assignee = this.truncate(issue.assignee || '-', 8);
      const priority = this.truncate(issue.priority || '-', 8);

      lines.push(
        `${this.pad(id, 8)}  ${this.pad(title, 17)}  ${this.pad(status, 12)}  ` +
        `${this.pad(assignee, 8)}  ${this.pad(priority, 8)}  ${issue.url}`
      );
    });

    // Pagination info
    if (result.pagination) {
      lines.push('');
      if (result.pagination.hasNextPage) {
        lines.push(`Showing ${result.items.length} results. Use --cursor=${result.pagination.endCursor} for next page.`);
      } else {
        lines.push(`Showing all ${result.items.length} results.`);
      }
    }

    return lines.join('\n');
  }

  static formatIssueDetail(issue: Issue): string {
    const lines: string[] = [];

    lines.push(`## ${issue.id}: ${issue.title}`);
    lines.push('');
    lines.push(`Status:     ${issue.status}`);
    if (issue.assignee) lines.push(`Assignee:   ${issue.assignee}`);
    if (issue.priority) lines.push(`Priority:   ${issue.priority}`);
    if (issue.project) lines.push(`Project:    ${issue.project}`);
    if (issue.cycle) lines.push(`Cycle:      ${issue.cycle}`);
    lines.push(`Created:    ${issue.createdAt}`);
    if (issue.updatedAt) lines.push(`Updated:    ${issue.updatedAt}`);
    lines.push(`URL:        ${issue.url}`);

    if (issue.description) {
      lines.push('');
      lines.push('### Description');
      lines.push('');
      lines.push(issue.description);
    }

    return lines.join('\n');
  }

  static formatProjectList(result: ListResult<Project>): string {
    const lines: string[] = [];

    lines.push(`## Projects (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No projects found.');
      return lines.join('\n');
    }

    lines.push('ID        Name               Progress  Start Date  Target Date  URL');
    lines.push('--------  -----------------  --------  ----------  -----------  -----------------------------------------');

    result.items.forEach(project => {
      const id = this.truncate(project.id, 8);
      const name = this.truncate(project.name, 17);
      const progress = `${Math.round(project.progress * 100)}%`;
      const startDate = project.startDate ? project.startDate.substring(0, 10) : '-';
      const targetDate = project.targetDate ? project.targetDate.substring(0, 10) : '-';

      lines.push(
        `${this.pad(id, 8)}  ${this.pad(name, 17)}  ${this.pad(progress, 8)}  ` +
        `${this.pad(startDate, 10)}  ${this.pad(targetDate, 11)}  ${project.url}`
      );
    });

    return lines.join('\n');
  }

  static formatProjectDetail(project: Project): string {
    const lines: string[] = [];

    lines.push(`## ${project.name}`);
    lines.push('');
    lines.push(`ID:          ${project.id}`);
    lines.push(`Progress:    ${Math.round(project.progress * 100)}%`);
    if (project.startDate) lines.push(`Start Date:  ${project.startDate.substring(0, 10)}`);
    if (project.targetDate) lines.push(`Target Date: ${project.targetDate.substring(0, 10)}`);
    lines.push(`URL:         ${project.url}`);

    if (project.description) {
      lines.push('');
      lines.push('### Description');
      lines.push('');
      lines.push(project.description);
    }

    return lines.join('\n');
  }

  static formatCycleList(result: ListResult<Cycle>): string {
    const lines: string[] = [];

    lines.push(`## Cycles (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No cycles found.');
      return lines.join('\n');
    }

    lines.push('ID        Name               Starts      Ends        Progress  URL');
    lines.push('--------  -----------------  ----------  ----------  --------  -----------------------------------------');

    result.items.forEach(cycle => {
      const id = this.truncate(cycle.id, 8);
      const name = this.truncate(cycle.name, 17);
      const starts = cycle.startsAt.substring(0, 10);
      const ends = cycle.endsAt.substring(0, 10);
      const progress = `${Math.round(cycle.progress * 100)}%`;

      lines.push(
        `${this.pad(id, 8)}  ${this.pad(name, 17)}  ${this.pad(starts, 10)}  ` +
        `${this.pad(ends, 10)}  ${this.pad(progress, 8)}  ${cycle.url}`
      );
    });

    return lines.join('\n');
  }

  static formatCycleDetail(cycle: Cycle): string {
    const lines: string[] = [];

    lines.push(`## ${cycle.name}`);
    lines.push('');
    lines.push(`ID:        ${cycle.id}`);
    lines.push(`Starts:    ${cycle.startsAt.substring(0, 10)}`);
    lines.push(`Ends:      ${cycle.endsAt.substring(0, 10)}`);
    lines.push(`Progress:  ${Math.round(cycle.progress * 100)}%`);
    lines.push(`URL:       ${cycle.url}`);

    return lines.join('\n');
  }

  static formatTeamList(result: ListResult<Team>): string {
    const lines: string[] = [];

    lines.push(`## Teams (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No teams found.');
      return lines.join('\n');
    }

    lines.push('ID        Key       Name');
    lines.push('--------  --------  --------------------------------------------------');

    result.items.forEach(team => {
      const id = this.truncate(team.id, 8);
      const key = this.truncate(team.key, 8);

      lines.push(`${this.pad(id, 8)}  ${this.pad(key, 8)}  ${team.name}`);
    });

    return lines.join('\n');
  }

  private static truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen - 3) + '...';
  }

  private static pad(str: string, width: number): string {
    return str + ' '.repeat(Math.max(0, width - str.length));
  }
}
```

**Step 3: Implement JSON formatter**

Create `packages/cli/src/lib/formatters/json.ts`:
```typescript
import { ListResult } from './types.js';

export class JSONFormatter {
  static format<T>(data: T | ListResult<T>): string {
    return JSON.stringify({ data }, null, 2);
  }
}
```

**Step 4: Create formatter index**

Create `packages/cli/src/lib/formatters/index.ts`:
```typescript
export * from './types.js';
export * from './markdown.js';
export * from './json.js';
```

**Step 5: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 6: Commit formatters**

```bash
git add packages/cli/src/lib/formatters/
git commit -m "feat: add markdown and JSON output formatters"
```

---

## Task 2: Issues Commands

**Files:**
- Create: `packages/cli/src/commands/issues.ts`
- Modify: `packages/cli/src/cli.ts`

**Step 1: Implement issues command handlers**

Create `packages/cli/src/commands/issues.ts`:
```typescript
import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Issue, ListResult } from '../lib/formatters/index.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';

export function createIssuesCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('issues');
  command.description('Manage issues');

  // issues list
  command
    .command('list')
    .description('List issues')
    .option('--limit <number>', 'number of results per page', config.defaults.limit.toString())
    .option('--cursor <cursor>', 'pagination cursor')
    .option('--fetch-all', 'fetch all pages')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const limit = parseInt(options.limit);
        let allIssues: Issue[] = [];
        let cursor: string | undefined = options.cursor;
        let hasNextPage = true;

        do {
          const response = await client.executeQuery(async (sdk) => {
            return sdk.issues({
              first: limit,
              after: cursor,
            });
          });

          const issues: Issue[] = response.nodes.map((issue: any) => ({
            id: issue.identifier,
            title: issue.title,
            status: issue.state?.name || 'Unknown',
            assignee: issue.assignee?.name,
            priority: issue.priorityLabel,
            createdAt: new Date(issue.createdAt).toISOString().substring(0, 10),
            updatedAt: issue.updatedAt ? new Date(issue.updatedAt).toISOString().substring(0, 10) : undefined,
            url: issue.url,
          }));

          allIssues = allIssues.concat(issues);
          hasNextPage = response.pageInfo.hasNextPage;
          cursor = response.pageInfo.endCursor;

          if (!options.fetchAll) break;
        } while (hasNextPage);

        const result: ListResult<Issue> = {
          items: allIssues,
          pagination: options.fetchAll ? undefined : {
            hasNextPage,
            endCursor: cursor,
          },
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatIssueList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  // issues show
  command
    .command('show <id>')
    .description('Show issue details')
    .action(async (id: string) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const response = await client.executeQuery(async (sdk) => {
          return sdk.issue(id);
        });

        if (!response) {
          throw new NotFoundError(`Issue ${id} not found`, { id });
        }

        const issue: Issue = {
          id: response.identifier,
          title: response.title,
          status: response.state?.name || 'Unknown',
          assignee: response.assignee?.name,
          priority: response.priorityLabel,
          createdAt: new Date(response.createdAt).toISOString().substring(0, 10),
          updatedAt: response.updatedAt ? new Date(response.updatedAt).toISOString().substring(0, 10) : undefined,
          url: response.url,
          description: response.description,
          project: response.project?.name,
          cycle: response.cycle?.name,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(issue));
        } else {
          console.log(MarkdownFormatter.formatIssueDetail(issue));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
```

**Step 2: Update CLI to use issues command**

Modify `packages/cli/src/cli.ts`:
```typescript
// Add import at top
import { createIssuesCommand } from './commands/issues.js';

// Replace the placeholder issues command with:
// After global options, before program.parse():

// Load config early for command creation
const globalOpts = program.opts();
let env: EnvironmentConfig;
let config: Config;

try {
  env = ConfigLoader.loadEnvironment();
  config = await ConfigLoader.loadConfig(globalOpts.config);
  config = ConfigLoader.applyProxyFromEnvironment(config, env);
} catch (error) {
  if (error instanceof Error) {
    ErrorFormatter.handleError(error, globalOpts.format || 'markdown');
  }
  process.exit(1);
}

// Add issues command
program.addCommand(createIssuesCommand(env, config, globalOpts.debug));

// Remove old placeholder:
// program
//   .command('issues')
//   .description('Manage issues')
//   .action(() => { ... });
```

**Step 3: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 4: Commit issues commands**

```bash
git add packages/cli/src/commands/issues.ts packages/cli/src/cli.ts
git commit -m "feat: add issues list and show commands"
```

---

## Task 3: Projects Commands

**Files:**
- Create: `packages/cli/src/commands/projects.ts`
- Modify: `packages/cli/src/cli.ts`

**Step 1: Implement projects command handlers**

Create `packages/cli/src/commands/projects.ts`:
```typescript
import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Project, ListResult } from '../lib/formatters/index.js';
import { NotFoundError } from '../lib/errors.js';

export function createProjectsCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('projects');
  command.description('Manage projects');

  // projects list
  command
    .command('list')
    .description('List projects')
    .option('--limit <number>', 'number of results per page', config.defaults.limit.toString())
    .option('--cursor <cursor>', 'pagination cursor')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const limit = parseInt(options.limit);
        const response = await client.executeQuery(async (sdk) => {
          return sdk.projects({
            first: limit,
            after: options.cursor,
          });
        });

        const projects: Project[] = response.nodes.map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          progress: project.progress,
          startDate: project.startDate,
          targetDate: project.targetDate,
          url: project.url,
        }));

        const result: ListResult<Project> = {
          items: projects,
          pagination: {
            hasNextPage: response.pageInfo.hasNextPage,
            endCursor: response.pageInfo.endCursor,
          },
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatProjectList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  // projects show
  command
    .command('show <id>')
    .description('Show project details')
    .action(async (id: string) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const response = await client.executeQuery(async (sdk) => {
          return sdk.project(id);
        });

        if (!response) {
          throw new NotFoundError(`Project ${id} not found`, { id });
        }

        const project: Project = {
          id: response.id,
          name: response.name,
          description: response.description,
          progress: response.progress,
          startDate: response.startDate,
          targetDate: response.targetDate,
          url: response.url,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(project));
        } else {
          console.log(MarkdownFormatter.formatProjectDetail(project));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
```

**Step 2: Update CLI to use projects command**

Modify `packages/cli/src/cli.ts`:
```typescript
// Add import at top
import { createProjectsCommand } from './commands/projects.js';

// Add after issues command
program.addCommand(createProjectsCommand(env, config, globalOpts.debug));

// Remove old placeholder:
// program
//   .command('projects')
//   .description('Manage projects')
//   .action(() => { ... });
```

**Step 3: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 4: Commit projects commands**

```bash
git add packages/cli/src/commands/projects.ts packages/cli/src/cli.ts
git commit -m "feat: add projects list and show commands"
```

---

## Task 4: Cycles Commands

**Files:**
- Create: `packages/cli/src/commands/cycles.ts`
- Modify: `packages/cli/src/cli.ts`

**Step 1: Implement cycles command handlers**

Create `packages/cli/src/commands/cycles.ts`:
```typescript
import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Cycle, ListResult } from '../lib/formatters/index.js';
import { NotFoundError } from '../lib/errors.js';

export function createCyclesCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('cycles');
  command.description('Manage cycles');

  // cycles list
  command
    .command('list')
    .description('List cycles')
    .option('--limit <number>', 'number of results per page', config.defaults.limit.toString())
    .option('--cursor <cursor>', 'pagination cursor')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const limit = parseInt(options.limit);
        const response = await client.executeQuery(async (sdk) => {
          return sdk.cycles({
            first: limit,
            after: options.cursor,
          });
        });

        const cycles: Cycle[] = response.nodes.map((cycle: any) => ({
          id: cycle.id,
          name: cycle.name,
          startsAt: cycle.startsAt,
          endsAt: cycle.endsAt,
          progress: cycle.progress,
          url: cycle.url,
        }));

        const result: ListResult<Cycle> = {
          items: cycles,
          pagination: {
            hasNextPage: response.pageInfo.hasNextPage,
            endCursor: response.pageInfo.endCursor,
          },
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatCycleList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  // cycles show
  command
    .command('show <id>')
    .description('Show cycle details')
    .action(async (id: string) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const response = await client.executeQuery(async (sdk) => {
          return sdk.cycle(id);
        });

        if (!response) {
          throw new NotFoundError(`Cycle ${id} not found`, { id });
        }

        const cycle: Cycle = {
          id: response.id,
          name: response.name,
          startsAt: response.startsAt,
          endsAt: response.endsAt,
          progress: response.progress,
          url: response.url,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(cycle));
        } else {
          console.log(MarkdownFormatter.formatCycleDetail(cycle));
        }
      } catch (error) {
        throw error;
      }
    });

  // cycles current
  command
    .command('current')
    .description('Show current cycle')
    .option('--team <id>', 'team ID')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        // Get all cycles and find the current one
        const response = await client.executeQuery(async (sdk) => {
          return sdk.cycles({
            first: 50,
            filter: options.team ? { team: { id: { eq: options.team } } } : undefined,
          });
        });

        const now = new Date();
        const currentCycle = response.nodes.find((cycle: any) => {
          const starts = new Date(cycle.startsAt);
          const ends = new Date(cycle.endsAt);
          return starts <= now && now <= ends;
        });

        if (!currentCycle) {
          throw new NotFoundError('No current cycle found', {});
        }

        const cycle: Cycle = {
          id: currentCycle.id,
          name: currentCycle.name,
          startsAt: currentCycle.startsAt,
          endsAt: currentCycle.endsAt,
          progress: currentCycle.progress,
          url: currentCycle.url,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(cycle));
        } else {
          console.log(MarkdownFormatter.formatCycleDetail(cycle));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
```

**Step 2: Update CLI to use cycles command**

Modify `packages/cli/src/cli.ts`:
```typescript
// Add import at top
import { createCyclesCommand } from './commands/cycles.js';

// Add after projects command
program.addCommand(createCyclesCommand(env, config, globalOpts.debug));

// Remove old placeholder:
// program
//   .command('cycles')
//   .description('Manage cycles')
//   .action(() => { ... });
```

**Step 3: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 4: Commit cycles commands**

```bash
git add packages/cli/src/commands/cycles.ts packages/cli/src/cli.ts
git commit -m "feat: add cycles list, show, and current commands"
```

---

## Task 5: Teams Commands

**Files:**
- Create: `packages/cli/src/commands/teams.ts`
- Modify: `packages/cli/src/cli.ts`

**Step 1: Implement teams command handlers**

Create `packages/cli/src/commands/teams.ts`:
```typescript
import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Team, ListResult } from '../lib/formatters/index.js';

export function createTeamsCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('teams');
  command.description('Manage teams');

  // teams list
  command
    .command('list')
    .description('List teams')
    .action(async () => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const response = await client.executeQuery(async (sdk) => {
          return sdk.teams();
        });

        const teams: Team[] = response.nodes.map((team: any) => ({
          id: team.id,
          name: team.name,
          key: team.key,
          description: team.description,
        }));

        const result: ListResult<Team> = {
          items: teams,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatTeamList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
```

**Step 2: Update CLI to use teams command**

Modify `packages/cli/src/cli.ts`:
```typescript
// Add import at top
import { createTeamsCommand } from './commands/teams.js';

// Add after cycles command
program.addCommand(createTeamsCommand(env, config, globalOpts.debug));

// Remove old placeholder:
// program
//   .command('teams')
//   .description('Manage teams')
//   .action(() => { ... });
```

**Step 3: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 4: Commit teams commands**

```bash
git add packages/cli/src/commands/teams.ts packages/cli/src/cli.ts
git commit -m "feat: add teams list command"
```

---

## Task 6: Update CLI Entry Point

**Files:**
- Modify: `packages/cli/src/cli.ts`

**Step 1: Refactor CLI to properly handle errors and load config**

The CLI needs to be restructured to handle async config loading and wrap all commands in error handling.

Modify `packages/cli/src/cli.ts`:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { ConfigLoader } from './config/loader.js';
import { ErrorFormatter } from './lib/error-formatter.js';
import { Config, EnvironmentConfig } from './config/types.js';
import { createIssuesCommand } from './commands/issues.js';
import { createProjectsCommand } from './commands/projects.js';
import { createCyclesCommand } from './commands/cycles.js';
import { createTeamsCommand } from './commands/teams.js';
import { LinearClient } from './lib/client.js';

const program = new Command();

program
  .name('linear-for-ai')
  .description('CLI tool for AI agents to interact with Linear GraphQL API')
  .version('0.1.0');

// Global options
program
  .option('--format <format>', 'output format (markdown|json)', 'markdown')
  .option('--debug', 'enable debug mode with request/response logging', false)
  .option('--config <path>', 'custom config file path')
  .option('--no-color', 'disable ANSI colors in output');

// Async main function to handle config loading
async function main() {
  const opts = program.opts();
  const format = opts.format as 'markdown' | 'json';

  try {
    // Load environment and config
    const env: EnvironmentConfig = ConfigLoader.loadEnvironment();
    const config: Config = await ConfigLoader.loadConfig(opts.config);
    const finalConfig = ConfigLoader.applyProxyFromEnvironment(config, env);

    // Add resource commands
    program.addCommand(createIssuesCommand(env, finalConfig, opts.debug));
    program.addCommand(createProjectsCommand(env, finalConfig, opts.debug));
    program.addCommand(createCyclesCommand(env, finalConfig, opts.debug));
    program.addCommand(createTeamsCommand(env, finalConfig, opts.debug));

    // Test connection command
    program
      .command('test-connection')
      .description('Test connection to Linear API')
      .action(async () => {
        try {
          const client = new LinearClient({
            env,
            config: finalConfig,
            debug: opts.debug,
          });

          const success = await client.testConnection();

          if (success) {
            if (format === 'json') {
              console.log(JSON.stringify({ success: true, message: 'Connected to Linear API' }, null, 2));
            } else {
              console.log('✓ Successfully connected to Linear API');
            }
            process.exit(0);
          } else {
            throw new Error('Connection test failed');
          }
        } catch (error) {
          ErrorFormatter.handleError(error as Error, format);
        }
      });

    // Parse arguments
    await program.parseAsync();
  } catch (error) {
    ErrorFormatter.handleError(error as Error, format);
  }
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

**Step 2: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 3: Test help command**

Run: `node packages/cli/dist/cli.js --help`

Expected: Shows all commands (issues, projects, cycles, teams, test-connection)

**Step 4: Commit CLI updates**

```bash
git add packages/cli/src/cli.ts
git commit -m "refactor: restructure CLI for async config loading and error handling"
```

---

## Task 7: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/GETTING_STARTED.md`
- Modify: `packages/cli/README.md`

**Step 1: Update root README**

Modify `README.md` to show Phase 2 as complete:
```markdown
## Status

**Phase 1 (Foundation):** ✅ Complete
**Phase 2 (Read Operations):** ✅ Complete
- Issues: list, show
- Projects: list, show
- Cycles: list, show, current
- Teams: list
- Markdown and JSON output formats
- Pagination support

**Phase 3 (Advanced Queries):** 📋 Planned
**Phase 4 (Write Operations):** 📋 Planned
```

Add usage examples:
```markdown
## Usage Examples

\`\`\`bash
# List issues
linear-for-ai issues list

# Show specific issue
linear-for-ai issues show ENG-123

# List projects
linear-for-ai projects list

# Show current cycle
linear-for-ai cycles current

# List teams
linear-for-ai teams list

# Output as JSON
linear-for-ai --format json issues list

# Pagination
linear-for-ai issues list --limit 10
linear-for-ai issues list --cursor abc123

# Fetch all pages
linear-for-ai issues list --fetch-all
\`\`\`
```

**Step 2: Update getting started guide**

Modify `docs/GETTING_STARTED.md` to add Phase 2 examples.

**Step 3: Update CLI package README**

Modify `packages/cli/README.md` to document all commands.

**Step 4: Commit documentation**

```bash
git add README.md docs/GETTING_STARTED.md packages/cli/README.md
git commit -m "docs: update documentation for Phase 2 read operations"
```

---

## Task 8: Final Verification and Tag

**Files:**
- None (verification only)

**Step 1: Run full build**

Run: `pnpm build`

Expected: All packages build successfully

**Step 2: Test commands with mock/no API key**

Run: `node packages/cli/dist/cli.js issues list`

Expected: Error about missing API key (graceful failure)

**Step 3: Verify help output**

Run: `node packages/cli/dist/cli.js issues --help`

Expected: Shows list and show subcommands

**Step 4: Check git status**

Run: `git status`

Expected: No uncommitted files

**Step 5: Create tag**

```bash
git tag v0.2.0-phase2
```

**Step 6: Verify tag**

Run: `git tag`

Expected: Shows v0.1.0-phase1 and v0.2.0-phase2

---

## Phase 2 Complete! 🎉

**What We Built:**
- ✅ Output formatters (Markdown with headers/tables, JSON)
- ✅ Issues commands (list with pagination, show)
- ✅ Projects commands (list, show)
- ✅ Cycles commands (list, show, current)
- ✅ Teams commands (list)
- ✅ Pagination support (--limit, --cursor, --fetch-all)
- ✅ Format support (--format markdown|json)
- ✅ Updated documentation

**What Works:**
- All read operations for issues, projects, cycles, teams
- Terminal-optimized markdown output with tables
- JSON output for machine parsing
- Pagination with cursor support
- Fetch-all for getting complete result sets

**Next Phase:**
Phase 3 will implement advanced queries with filtering, relations, dependencies, and session caching.
