# Development Guide

## Prerequisites

- [Deno 2.x](https://deno.land/) installed

## Commands

```bash
# Run in development mode
deno task dev issues list

# Run tests
deno task test

# Run tests in watch mode
deno task test:watch

# Format code
deno task fmt

# Lint code
deno task lint

# Type check
deno task check
```

## Building

```bash
# Build standalone executable
./scripts/build.sh

# Or use Deno task
deno task compile
```

## Running Tests

```bash
# All tests
deno task test

# Specific test file
deno test tests/lib/config.test.ts

# With coverage
deno test --coverage=coverage
```

## Project Structure

```
linear-for-ai/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── commands/           # Command implementations
│   │   └── issues.ts
│   ├── lib/
│   │   ├── graphql-client.ts   # GraphQL client
│   │   ├── queries/            # Query builders
│   │   ├── formatters/         # Output formatters
│   │   ├── config.ts           # Config loader
│   │   └── env.ts              # Environment loader
│   └── types/              # TypeScript types
├── tests/
│   ├── lib/                # Unit tests
│   ├── commands/           # Command tests
│   └── integration/        # Integration tests
├── docs/                   # Documentation
├── scripts/                # Build scripts
└── deno.json              # Deno configuration
```

## Architecture

### Design Decisions

1. **Deno**: Native TypeScript, built-in testing, single executable
2. **Direct GraphQL**: Bypasses SDK limitations
3. **Token-efficient output**: Minimizes AI token usage
4. **Web URLs**: Enables human verification
5. **Zero runtime dependencies**: Self-contained executable

### Security

- API keys redacted in logs (last 4 chars only)
- Writes require explicit config and flags
- HTTPS only
- Proxy support

## Contributing

1. Fork and create feature branch
2. Add tests for changes
3. Run `deno task test` and `deno task fmt`
4. Commit: `git commit -m "feat: description"`
5. Create Pull Request

**Code style:** TypeScript strict mode, 100 char lines, single quotes, 2 spaces, descriptive names
