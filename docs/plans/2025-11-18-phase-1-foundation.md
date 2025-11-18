# Phase 1: Foundation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the linear-for-ai project foundation with pnpm workspace, TypeScript configuration, CLI framework, configuration management, Linear SDK client wrapper, and basic error handling with debug mode.

**Architecture:** pnpm monorepo with packages/cli as main package. TypeScript ESM modules. commander.js for CLI parsing. dotenv for environment variables. @linear/sdk for Linear API integration. Structured error handling with both human-readable stderr and machine-parseable stdout.

**Tech Stack:** Node.js 18+, pnpm, TypeScript 5+, commander.js, dotenv, @linear/sdk, chalk (for colored debug output only)

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`

**Step 1: Initialize root package.json**

Create `package.json`:
```json
{
  "name": "linear-for-ai-workspace",
  "version": "0.1.0",
  "private": true,
  "description": "CLI tool for AI agents to interact with Linear API",
  "repository": {
    "type": "git",
    "url": "https://github.com/ramynasr/linear-for-ai.git"
  },
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint"
  }
}
```

**Step 2: Create pnpm workspace configuration**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
```

**Step 3: Create .gitignore**

Create `.gitignore`:
```
# Dependencies
node_modules/

# Build output
dist/
*.tsbuildinfo

# Environment
.env
.env.local

# Internal docs (transient)
internal-docs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
```

**Step 4: Create .env.example**

Create `.env.example`:
```bash
# Linear API Configuration
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Custom config file path
# LINEAR_CONFIG=/custom/path/to/config.json

# Optional: Proxy configuration
# HTTPS_PROXY=http://proxy.example.com:8080
# HTTP_PROXY=http://proxy.example.com:8080
```

**Step 5: Create CLI package.json**

Create `packages/cli/package.json`:
```json
{
  "name": "linear-for-ai",
  "version": "0.1.0",
  "description": "CLI tool for AI agents to interact with Linear GraphQL API",
  "type": "module",
  "bin": {
    "linear-for-ai": "./dist/cli.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "echo \"Tests not yet implemented\" && exit 0",
    "lint": "echo \"Linting not yet configured\" && exit 0"
  },
  "keywords": [
    "linear",
    "cli",
    "ai",
    "graphql"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@linear/sdk": "^26.0.0",
    "commander": "^11.1.0",
    "dotenv": "^16.3.1",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Step 6: Create TypeScript configuration**

Create `packages/cli/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 7: Install dependencies**

Run: `pnpm install`

Expected: Dependencies installed, pnpm-lock.yaml created

**Step 8: Commit project initialization**

```bash
git init
git add package.json pnpm-workspace.yaml .gitignore .env.example packages/cli/package.json packages/cli/tsconfig.json pnpm-lock.yaml
git commit -m "chore: initialize project with pnpm workspace"
```

---

## Task 2: Configuration Management

**Files:**
- Create: `packages/cli/src/config/types.ts`
- Create: `packages/cli/src/config/loader.ts`
- Create: `packages/cli/src/config/defaults.ts`

**Step 1: Write test for config types**

Create `packages/cli/src/config/types.ts`:
```typescript
export interface ProxyConfig {
  enabled: boolean;
  url?: string;
}

export interface FieldDefaults {
  issue: string[];
  project: string[];
  cycle: string[];
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
}

export interface ConfigDefaults {
  format: 'markdown' | 'json';
  limit: number;
  fields: FieldDefaults;
}

export interface Config {
  allowWrites: boolean;
  proxy: ProxyConfig;
  defaults: ConfigDefaults;
  cache: CacheConfig;
}

export interface EnvironmentConfig {
  apiKey: string;
  configPath?: string;
  httpsProxy?: string;
  httpProxy?: string;
}
```

**Step 2: Create default configuration**

Create `packages/cli/src/config/defaults.ts`:
```typescript
import { Config } from './types.js';

export const DEFAULT_CONFIG: Config = {
  allowWrites: false,
  proxy: {
    enabled: false,
  },
  defaults: {
    format: 'markdown',
    limit: 50,
    fields: {
      issue: ['id', 'title', 'status', 'assignee', 'priority', 'createdAt', 'url'],
      project: ['id', 'name', 'progress', 'startDate', 'targetDate', 'url'],
      cycle: ['id', 'name', 'startsAt', 'endsAt', 'progress', 'url'],
    },
  },
  cache: {
    enabled: true,
    ttl: 300,
  },
};
```

**Step 3: Implement config loader**

Create `packages/cli/src/config/loader.ts`:
```typescript
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { config as loadEnv } from 'dotenv';
import { Config, EnvironmentConfig } from './types.js';
import { DEFAULT_CONFIG } from './defaults.js';

export class ConfigLoader {
  private static DEFAULT_CONFIG_PATH = join(
    homedir(),
    '.config',
    'linear-for-ai',
    'config.json'
  );

  static loadEnvironment(): EnvironmentConfig {
    // Load .env file if it exists
    loadEnv();

    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error(
        'LINEAR_API_KEY environment variable is required. ' +
        'Set it in your shell or create a .env file.'
      );
    }

    return {
      apiKey,
      configPath: process.env.LINEAR_CONFIG,
      httpsProxy: process.env.HTTPS_PROXY,
      httpProxy: process.env.HTTP_PROXY,
    };
  }

  static async loadConfig(customPath?: string): Promise<Config> {
    const configPath = customPath || this.DEFAULT_CONFIG_PATH;

    if (!existsSync(configPath)) {
      return { ...DEFAULT_CONFIG };
    }

    try {
      const content = await readFile(configPath, 'utf-8');
      const userConfig = JSON.parse(content);

      // Deep merge user config with defaults
      return this.mergeConfig(DEFAULT_CONFIG, userConfig);
    } catch (error) {
      throw new Error(
        `Failed to load config from ${configPath}: ${(error as Error).message}`
      );
    }
  }

  private static mergeConfig(defaults: Config, user: Partial<Config>): Config {
    return {
      allowWrites: user.allowWrites ?? defaults.allowWrites,
      proxy: {
        enabled: user.proxy?.enabled ?? defaults.proxy.enabled,
        url: user.proxy?.url ?? defaults.proxy.url,
      },
      defaults: {
        format: user.defaults?.format ?? defaults.defaults.format,
        limit: user.defaults?.limit ?? defaults.defaults.limit,
        fields: {
          issue: user.defaults?.fields?.issue ?? defaults.defaults.fields.issue,
          project: user.defaults?.fields?.project ?? defaults.defaults.fields.project,
          cycle: user.defaults?.fields?.cycle ?? defaults.defaults.fields.cycle,
        },
      },
      cache: {
        enabled: user.cache?.enabled ?? defaults.cache.enabled,
        ttl: user.cache?.ttl ?? defaults.cache.ttl,
      },
    };
  }

  static applyProxyFromEnvironment(config: Config, env: EnvironmentConfig): Config {
    const proxyUrl = env.httpsProxy || env.httpProxy;

    if (proxyUrl && !config.proxy.enabled) {
      return {
        ...config,
        proxy: {
          enabled: true,
          url: proxyUrl,
        },
      };
    }

    return config;
  }
}
```

**Step 4: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully, dist/ directory created

**Step 5: Commit configuration management**

```bash
git add packages/cli/src/config/
git commit -m "feat: add configuration management with env and file support"
```

---

## Task 3: Error Handling System

**Files:**
- Create: `packages/cli/src/lib/errors.ts`
- Create: `packages/cli/src/lib/error-formatter.ts`

**Step 1: Define error types**

Create `packages/cli/src/lib/errors.ts`:
```typescript
export enum ErrorCode {
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GRAPHQL_ERROR = 'GRAPHQL_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
}

export class LinearForAIError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LinearForAIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.AUTH_ERROR, message, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.NOT_FOUND, message, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.RATE_LIMIT, message, details);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.NETWORK_ERROR, message, details);
    this.name = 'NetworkError';
  }
}

export class GraphQLError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.GRAPHQL_ERROR, message, details);
    this.name = 'GraphQLError';
  }
}

export class ConfigError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.CONFIG_ERROR, message, details);
    this.name = 'ConfigError';
  }
}
```

**Step 2: Implement error formatter**

Create `packages/cli/src/lib/error-formatter.ts`:
```typescript
import chalk from 'chalk';
import { LinearForAIError } from './errors.js';

export class ErrorFormatter {
  static formatForHuman(error: Error | LinearForAIError): string {
    if (error instanceof LinearForAIError) {
      const lines = [
        chalk.red('❌ Error: ') + error.message,
        chalk.gray('Code: ') + error.code,
      ];

      if (error.details) {
        Object.entries(error.details).forEach(([key, value]) => {
          lines.push(chalk.gray(`${key}: `) + String(value));
        });
      }

      // Add suggestions based on error code
      const suggestion = this.getSuggestion(error.code);
      if (suggestion) {
        lines.push('');
        lines.push(chalk.yellow('Suggestion: ') + suggestion);
      }

      return lines.join('\n');
    }

    // Generic error
    return chalk.red('❌ Error: ') + error.message;
  }

  static formatForMachine(error: Error | LinearForAIError): string {
    if (error instanceof LinearForAIError) {
      return JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details || {},
        },
      }, null, 2);
    }

    return JSON.stringify({
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: {},
      },
    }, null, 2);
  }

  private static getSuggestion(code: string): string | null {
    const suggestions: Record<string, string> = {
      AUTH_ERROR: 'Check that LINEAR_API_KEY is set correctly in your environment',
      NOT_FOUND: 'Verify the resource ID exists and you have access to it',
      VALIDATION_ERROR: 'Check the command syntax and required parameters',
      RATE_LIMIT: 'Wait a moment before retrying. Consider reducing request frequency',
      NETWORK_ERROR: 'Check your internet connection and proxy settings',
      GRAPHQL_ERROR: 'The query may have invalid syntax or requested non-existent fields',
      CONFIG_ERROR: 'Check your config file at ~/.config/linear-for-ai/config.json',
    };

    return suggestions[code] || null;
  }

  static handleError(error: Error | LinearForAIError, format: 'markdown' | 'json'): never {
    // Write human-readable to stderr
    console.error(this.formatForHuman(error));

    // Write machine-readable to stdout if JSON format
    if (format === 'json') {
      console.log(this.formatForMachine(error));
    }

    // Exit with error code
    process.exit(1);
  }
}
```

**Step 3: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 4: Commit error handling**

```bash
git add packages/cli/src/lib/errors.ts packages/cli/src/lib/error-formatter.ts
git commit -m "feat: add error handling system with typed errors and formatters"
```

---

## Task 4: Linear SDK Client Wrapper

**Files:**
- Create: `packages/cli/src/lib/client.ts`
- Create: `packages/cli/src/lib/debug.ts`

**Step 1: Implement debug logger with key redaction**

Create `packages/cli/src/lib/debug.ts`:
```typescript
import chalk from 'chalk';

export class DebugLogger {
  constructor(private enabled: boolean) {}

  static redactApiKey(key: string): string {
    if (key.length <= 4) return '***';
    return `LINEAR_...${key.slice(-4)}`;
  }

  static redactHeaders(headers: Record<string, string>): Record<string, string> {
    const redacted = { ...headers };

    if (redacted.Authorization) {
      const match = redacted.Authorization.match(/Bearer (.+)/);
      if (match) {
        redacted.Authorization = `Bearer ${this.redactApiKey(match[1])}`;
      }
    }

    return redacted;
  }

  logRequest(method: string, url: string, headers: Record<string, string>, body?: unknown): void {
    if (!this.enabled) return;

    console.error(chalk.cyan('[DEBUG] GraphQL Request'));
    console.error(`${method} ${url}`);
    console.error(chalk.gray('Headers:'));
    const redactedHeaders = DebugLogger.redactHeaders(headers);
    Object.entries(redactedHeaders).forEach(([key, value]) => {
      console.error(chalk.gray(`  ${key}: ${value}`));
    });

    if (body) {
      console.error(chalk.gray('Body:'));
      console.error(JSON.stringify(body, null, 2));
    }
    console.error('');
  }

  logResponse(status: number, statusText: string, body: unknown, duration: number): void {
    if (!this.enabled) return;

    console.error(chalk.cyan(`[DEBUG] GraphQL Response (${duration}ms)`));
    console.error(`Status: ${status} ${statusText}`);
    console.error(chalk.gray('Body:'));
    console.error(JSON.stringify(body, null, 2));
    console.error('');
  }

  logError(error: Error): void {
    if (!this.enabled) return;

    console.error(chalk.red('[DEBUG] Error'));
    console.error(error.message);
    if (error.stack) {
      console.error(chalk.gray(error.stack));
    }
    console.error('');
  }
}
```

**Step 2: Implement Linear client wrapper**

Create `packages/cli/src/lib/client.ts`:
```typescript
import { LinearClient as LinearSDK } from '@linear/sdk';
import { EnvironmentConfig, Config } from '../config/types.js';
import { AuthError, NetworkError, RateLimitError } from './errors.js';
import { DebugLogger } from './debug.js';

export interface LinearClientOptions {
  env: EnvironmentConfig;
  config: Config;
  debug: boolean;
}

export class LinearClient {
  private sdk: LinearSDK;
  private debug: DebugLogger;

  constructor(private options: LinearClientOptions) {
    this.debug = new DebugLogger(options.debug);

    // Configure proxy if enabled
    const fetchOptions: RequestInit = {};
    if (options.config.proxy.enabled && options.config.proxy.url) {
      // Note: fetch doesn't natively support proxy, would need http-proxy-agent
      // For now, rely on HTTPS_PROXY environment variable
      this.debug.logRequest(
        'INFO',
        'Proxy configured',
        { 'Proxy-URL': options.config.proxy.url },
        undefined
      );
    }

    try {
      this.sdk = new LinearSDK({
        apiKey: options.env.apiKey,
      });
    } catch (error) {
      throw new AuthError(
        'Failed to initialize Linear client',
        { error: (error as Error).message }
      );
    }
  }

  get client(): LinearSDK {
    return this.sdk;
  }

  async executeQuery<T>(
    queryFn: (client: LinearSDK) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFn(this.sdk);
      const duration = Date.now() - startTime;

      if (this.options.debug) {
        this.debug.logResponse(200, 'OK', result, duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.debug.logError(error as Error);

      // Map Linear SDK errors to our error types
      const err = error as Error;

      if (err.message.includes('Unauthorized') || err.message.includes('Invalid API key')) {
        throw new AuthError('Invalid or missing API key', {
          originalError: err.message
        });
      }

      if (err.message.includes('Rate limit')) {
        throw new RateLimitError('API rate limit exceeded', {
          originalError: err.message
        });
      }

      if (err.message.includes('Network') || err.message.includes('ENOTFOUND')) {
        throw new NetworkError('Network request failed', {
          originalError: err.message
        });
      }

      throw new NetworkError('Linear API request failed', {
        originalError: err.message
      });
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const viewer = await this.executeQuery(client => client.viewer);
      this.debug.logRequest(
        'GET',
        'https://api.linear.app/graphql',
        { 'Authorization': `Bearer ${DebugLogger.redactApiKey(this.options.env.apiKey)}` },
        { query: 'query { viewer { id name email } }' }
      );
      return !!viewer;
    } catch (error) {
      return false;
    }
  }
}
```

**Step 3: Build and verify**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully

**Step 4: Commit Linear client wrapper**

```bash
git add packages/cli/src/lib/client.ts packages/cli/src/lib/debug.ts
git commit -m "feat: add Linear SDK client wrapper with debug logging"
```

---

## Task 5: CLI Entry Point and Argument Parsing

**Files:**
- Create: `packages/cli/src/cli.ts`
- Create: `packages/cli/src/index.ts`

**Step 1: Implement CLI entry point**

Create `packages/cli/src/cli.ts`:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { ConfigLoader } from './config/loader.js';
import { LinearClient } from './lib/client.js';
import { ErrorFormatter } from './lib/error-formatter.js';
import { Config, EnvironmentConfig } from './config/types.js';

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

// Placeholder commands - will be implemented in later phases
program
  .command('issues')
  .description('Manage issues')
  .action(() => {
    console.log('Issues commands not yet implemented');
    process.exit(0);
  });

program
  .command('projects')
  .description('Manage projects')
  .action(() => {
    console.log('Projects commands not yet implemented');
    process.exit(0);
  });

program
  .command('cycles')
  .description('Manage cycles')
  .action(() => {
    console.log('Cycles commands not yet implemented');
    process.exit(0);
  });

program
  .command('teams')
  .description('Manage teams')
  .action(() => {
    console.log('Teams commands not yet implemented');
    process.exit(0);
  });

// Test connection command
program
  .command('test-connection')
  .description('Test connection to Linear API')
  .action(async () => {
    const opts = program.opts();
    const format = opts.format as 'markdown' | 'json';

    try {
      // Load environment and config
      const env: EnvironmentConfig = ConfigLoader.loadEnvironment();
      const config: Config = await ConfigLoader.loadConfig(opts.config);
      const finalConfig = ConfigLoader.applyProxyFromEnvironment(config, env);

      // Create client
      const client = new LinearClient({
        env,
        config: finalConfig,
        debug: opts.debug,
      });

      // Test connection
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
program.parse();
```

**Step 2: Create index export**

Create `packages/cli/src/index.ts`:
```typescript
// Export public API for programmatic use
export { LinearClient } from './lib/client.js';
export { ConfigLoader } from './config/loader.js';
export * from './config/types.js';
export * from './lib/errors.js';
export { ErrorFormatter } from './lib/error-formatter.js';
```

**Step 3: Build the CLI**

Run: `pnpm -F linear-for-ai build`

Expected: TypeScript compiles successfully, dist/cli.js created with shebang

**Step 4: Make CLI executable**

Run: `chmod +x packages/cli/dist/cli.js`

Expected: File permissions changed

**Step 5: Test CLI help**

Run: `node packages/cli/dist/cli.js --help`

Expected: Help text displayed with commands

**Step 6: Commit CLI entry point**

```bash
git add packages/cli/src/cli.ts packages/cli/src/index.ts
git commit -m "feat: add CLI entry point with commander and test-connection command"
```

---

## Task 6: Testing and Documentation

**Files:**
- Create: `README.md` (root)
- Create: `packages/cli/README.md`
- Create: `docs/GETTING_STARTED.md`

**Step 1: Create root README**

Create `README.md`:
```markdown
# linear-for-ai

CLI tool for AI agents to interact with Linear's GraphQL API directly.

## Status

**Phase 1 (Foundation):** ✅ Complete
- Project setup with pnpm workspace
- Configuration management
- Linear SDK client wrapper
- Error handling system
- CLI framework

**Phase 2 (Read Operations):** 🚧 Coming next
**Phase 3 (Advanced Queries):** 📋 Planned
**Phase 4 (Write Operations):** 📋 Planned

## Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Linear API key ([get one here](https://linear.app/settings/api))

### Installation (Development)

\`\`\`bash
# Clone the repository
git clone https://github.com/ramynasr/linear-for-ai.git
cd linear-for-ai

# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Create .env file
cp .env.example .env
# Edit .env and add your LINEAR_API_KEY
\`\`\`

### Test Connection

\`\`\`bash
# Test your Linear API connection
node packages/cli/dist/cli.js test-connection

# With debug mode
node packages/cli/dist/cli.js --debug test-connection
\`\`\`

## Project Structure

\`\`\`
linear-for-ai/
├── packages/cli/          # Main CLI package
├── docs/                  # Documentation
├── internal-docs/         # Design docs (git-ignored)
└── docs/plans/            # Implementation plans
\`\`\`

## Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [Design Document](internal-docs/design.md)
- [Implementation Plans](docs/plans/)

## License

MIT
```

**Step 2: Create CLI package README**

Create `packages/cli/README.md`:
```markdown
# linear-for-ai

CLI tool for AI agents to interact with Linear GraphQL API.

## Installation

\`\`\`bash
npm install -g linear-for-ai
# or
pnpm add -g linear-for-ai
\`\`\`

## Configuration

Set your Linear API key:

\`\`\`bash
export LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

Or create a \`.env\` file in your project root.

## Usage

\`\`\`bash
# Test connection
linear-for-ai test-connection

# Show help
linear-for-ai --help

# Debug mode
linear-for-ai --debug test-connection
\`\`\`

## Commands (Coming Soon)

- \`linear-for-ai issues list\` - List issues
- \`linear-for-ai issues show <id>\` - Show issue details
- \`linear-for-ai projects list\` - List projects
- \`linear-for-ai cycles current\` - Show current cycle

See [documentation](../../docs/) for full details.
```

**Step 3: Create getting started guide**

Create `docs/GETTING_STARTED.md`:
```markdown
# Getting Started with linear-for-ai

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Linear API Key** - [Generate here](https://linear.app/settings/api)

## Development Setup

### 1. Clone and Install

\`\`\`bash
git clone https://github.com/ramynasr/linear-for-ai.git
cd linear-for-ai
pnpm install
\`\`\`

### 2. Configure Environment

\`\`\`bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API key
nano .env
\`\`\`

Your \`.env\` file should contain:

\`\`\`
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

### 3. Build and Test

\`\`\`bash
# Build the CLI
pnpm build

# Test connection to Linear
node packages/cli/dist/cli.js test-connection
\`\`\`

You should see: ✓ Successfully connected to Linear API

### 4. Debug Mode

\`\`\`bash
# Enable debug logging
node packages/cli/dist/cli.js --debug test-connection
\`\`\`

Debug mode shows:
- Request headers (with redacted API keys)
- Request body
- Response status and body
- Timing information

## Configuration File

Create \`~/.config/linear-for-ai/config.json\`:

\`\`\`json
{
  "allowWrites": false,
  "proxy": {
    "enabled": false
  },
  "defaults": {
    "format": "markdown",
    "limit": 50
  }
}
\`\`\`

See [design document](../internal-docs/design.md) for all configuration options.

## Next Steps

- **Phase 2:** Read operations (issues, projects, cycles)
- **Phase 3:** Advanced queries and filtering
- **Phase 4:** Write operations with confirmation

See [implementation plans](plans/) for detailed roadmap.
```

**Step 4: Commit documentation**

```bash
git add README.md packages/cli/README.md docs/GETTING_STARTED.md
git commit -m "docs: add README and getting started guide"
```

---

## Task 7: Final Verification and Cleanup

**Step 1: Run full build**

Run: `pnpm build`

Expected: All packages build successfully

**Step 2: Verify CLI works**

Run: `node packages/cli/dist/cli.js --help`

Expected: Help text displays all commands

**Step 3: Test with real API key (if available)**

Run: `LINEAR_API_KEY=your_key_here node packages/cli/dist/cli.js test-connection`

Expected: Connection success or appropriate error

**Step 4: Test debug mode**

Run: `LINEAR_API_KEY=your_key_here node packages/cli/dist/cli.js --debug test-connection`

Expected: Debug output shows redacted API key (last 4 chars visible)

**Step 5: Verify .env.example has no secrets**

Run: `cat .env.example`

Expected: Only placeholder values, no real API keys

**Step 6: Check git status**

Run: `git status`

Expected: No uncommitted files (except .env if created)

**Step 7: Final commit**

```bash
git add -A
git commit -m "chore: finalize phase 1 foundation"
git tag v0.1.0-phase1
```

---

## Phase 1 Complete! 🎉

**What We Built:**
- ✅ pnpm workspace with TypeScript
- ✅ Configuration system (env + JSON config)
- ✅ Linear SDK client wrapper
- ✅ Error handling with typed errors
- ✅ Debug mode with API key redaction
- ✅ CLI framework with commander
- ✅ Documentation

**What Works:**
- `linear-for-ai --help` - Show help
- `linear-for-ai test-connection` - Test Linear API
- `linear-for-ai --debug test-connection` - Test with debug logging

**Next Phase:**
Phase 2 will implement read operations (issues list/show, projects, cycles) with markdown/JSON formatting.

**Verification Checklist:**
- [ ] `pnpm install` succeeds
- [ ] `pnpm build` completes without errors
- [ ] `linear-for-ai --help` shows commands
- [ ] `test-connection` works with valid API key
- [ ] Debug mode redacts API keys correctly
- [ ] All files committed to git
