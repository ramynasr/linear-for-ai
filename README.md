# linear-for-ai

CLI for AI agents to interact with Linear's GraphQL API.

## Overview

Command-line interface for AI agents to query Linear efficiently:

- Terminal-optimized markdown (token-efficient)
- JSON output for programmatic use
- Direct GraphQL access (overcomes MCP limitations)
- Web URLs in all responses
- Standalone executable, no runtime dependencies

## Installation

### Homebrew (Recommended)

```bash
brew tap ramynasr/tap
brew install linear-for-ai
```

Supports macOS (Intel and Apple Silicon) and Linux (x86_64 and ARM64).

### Pre-built Binaries

Download from the [releases page](https://github.com/ramynasr/linear-for-ai/releases). Replace `{PLATFORM}` with `macos-x64`, `macos-arm64`, `linux-x64`, or `linux-arm64`:

```bash
curl -L https://github.com/ramynasr/linear-for-ai/releases/latest/download/linear-for-ai-{PLATFORM} -o linear-for-ai
chmod +x linear-for-ai
sudo mv linear-for-ai /usr/local/bin/
```

### From Source (Deno)

```bash
git clone https://github.com/ramynasr/linear-for-ai.git
cd linear-for-ai
deno task compile
cp ./dist/linear-for-ai /usr/local/bin/
```

## Configuration

### Environment Variables

Required: `LINEAR_API_KEY` (get from Linear Settings → API → Personal API Keys)

Optional: `LINEAR_CONFIG`, `HTTPS_PROXY`

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Config File

Customize defaults in `~/.config/linear-for-ai/config.json`:

```json
{
  "allowWrites": false,
  "defaults": {
    "format": "markdown",
    "limit": 50,
    "fields": {
      "issues": ["id", "identifier", "title", "state.name", "url"]
    }
  }
}
```

See `config.example.json` for all options. Full docs: [docs/configuration.md](docs/configuration.md)

## Usage

### Commands

```bash
# List all issues
linear-for-ai issues list

# List with pagination limit
linear-for-ai issues list --limit 25

# Show specific issue
linear-for-ai issues show ENG-123

# Output as JSON
linear-for-ai issues list --format json

# Custom field selection
linear-for-ai issues list --fields id,title,url
```

### Global Options

```bash
--format <markdown|json>  # Output format (default: markdown)
--debug                   # Show debug information including API calls
--config <path>           # Custom config file path
--no-color                # Disable ANSI colors
--fields <fields>         # Override default field selection
--limit <N>               # Pagination limit
-h, --help               # Show help message
-v, --version            # Show version
```

### Output Formats

#### Markdown (Default)

Token-efficient tables for AI consumption:

```
## Issues (3 results)

ID       Title              Status        Priority  URL
------   -----------------  ------------  --------  --------------------------------
ENG-123  Fix login bug      In Progress   High      https://linear.app/team/ENG-123
ENG-124  Add dark mode      Todo          Medium    https://linear.app/team/ENG-124
ENG-125  Update docs        Done          Low       https://linear.app/team/ENG-125
```

#### JSON

Structured output for programs:

```json
{
  "data": {
    "issues": {
      "nodes": [
        {
          "id": "1",
          "identifier": "ENG-123",
          "title": "Fix login bug",
          "url": "https://linear.app/team/ENG-123"
        }
      ]
    }
  }
}
```

### Initiatives

List initiatives (default: owned by you):

```bash
linear-for-ai initiatives list
linear-for-ai initiatives list --filter 'status:active'
linear-for-ai initiatives list --fetch-all  # Show all initiatives
```

Show initiative details:

```bash
linear-for-ai initiatives show abc123def456
linear-for-ai initiatives show https://linear.app/workspace/initiative/q4-platform-abc123def456
```

Options:
- `--filter <string>` - Filter initiatives (e.g., `status:active`, `health:atRisk`)
- `--fetch-all` - Show all initiatives (not just owned by you)
- `--fields <fields>` - Custom field selection
- `--format <format>` - Output format: `markdown` or `json`

### Examples

```bash
# List issues with custom fields
linear-for-ai issues list --fields id,title,assignee.displayName,url

# Show issue with all details in JSON
linear-for-ai issues show ENG-123 --format json

# List your initiatives
linear-for-ai initiatives list

# Show initiative with nested resources
linear-for-ai initiatives show abc123def456

# Debug mode to see API calls
linear-for-ai issues list --debug
```

## Development

### Prerequisites

- [Deno 2.x](https://deno.land/) installed

### Commands

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

### Project Structure

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

### Running Tests

```bash
# All tests
deno task test

# Specific test file
deno test tests/lib/config.test.ts

# With coverage
deno test --coverage=coverage
```

### Building

```bash
# Build standalone executable
./scripts/build.sh

# Or use Deno task
deno task compile
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

## Troubleshooting

**API key not working?** Verify with `echo $LINEAR_API_KEY` or run with `--debug`

**Permission errors?** Run `chmod +x ./dist/linear-for-ai`

**Behind proxy?** Set `export HTTPS_PROXY=http://proxy.example.com:8080`

## Contributing

1. Fork and create feature branch
2. Add tests for changes
3. Run `deno task test` and `deno task fmt`
4. Commit: `git commit -m "feat: description"`
5. Create Pull Request

Code style: TypeScript strict mode, 100 char lines, single quotes, 2 spaces, descriptive names

## Roadmap

**Current (v0.1.0):** Issues list/show, markdown/JSON output, config support, standalone executable

**Planned:** Projects, teams, cycles, write operations, filtering, caching

## License

MIT

## Credits

Built with:

- [Deno](https://deno.land/) - Modern JavaScript runtime
- [Linear GraphQL API](https://linear.app/developers) - Linear's API

Created by [Ramy Nasr](https://github.com/ramynasr)
