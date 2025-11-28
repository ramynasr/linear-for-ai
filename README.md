# linear-for-ai

CLI tool for AI agents to interact with Linear's GraphQL API.

## Overview

`linear-for-ai` is a command-line interface designed specifically for AI agents to query and interact with Linear's API efficiently. It provides:

- Terminal-optimized markdown output (token-efficient for AI consumption)
- JSON output for programmatic processing
- Direct GraphQL access to overcome MCP limitations
- Web URLs included in all responses for easy navigation
- Standalone executable with no runtime dependencies

## Installation

### From Source (Deno)

```bash
# Clone repository
git clone https://github.com/ramynasr/linear-for-ai.git
cd linear-for-ai

# Compile to standalone executable
./scripts/build.sh

# Binary available at: ./dist/linear-for-ai
```

Alternatively, use the Deno task:

```bash
deno task compile
```

### Move to PATH (Optional)

```bash
# Copy executable to a directory in your PATH
cp ./dist/linear-for-ai /usr/local/bin/

# Or add dist directory to your PATH
export PATH="$PATH:$(pwd)/dist"
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Required
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
LINEAR_CONFIG=/custom/path/to/config.json
HTTPS_PROXY=http://proxy.example.com:8080
```

Get your API key from: Linear Settings → API → Personal API Keys

### Config File

Create `~/.config/linear-for-ai/config.json` to customize defaults:

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

See `config.example.json` for full configuration options.

Full documentation: [docs/configuration.md](docs/configuration.md)

## Usage

### Basic Commands

#### Issues

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

Token-efficient table format optimized for AI consumption:

```
## Issues (3 results)

ID       Title              Status        Priority  URL
------   -----------------  ------------  --------  --------------------------------
ENG-123  Fix login bug      In Progress   High      https://linear.app/team/ENG-123
ENG-124  Add dark mode      Todo          Medium    https://linear.app/team/ENG-124
ENG-125  Update docs        Done          Low       https://linear.app/team/ENG-125
```

#### JSON

Structured output for programmatic processing:

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

### Examples

```bash
# List issues with custom fields
linear-for-ai issues list --fields id,title,assignee.displayName,url

# Show issue with all details in JSON
linear-for-ai issues show ENG-123 --format json

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

### Key Design Decisions

1. **Deno over Node.js**: Native TypeScript support, built-in testing, single executable compilation
2. **Direct GraphQL**: Bypasses SDK limitations for complex queries
3. **Token-efficient output**: Markdown tables minimize token usage for AI agents
4. **Web URLs**: Always included for human verification
5. **Zero runtime dependencies**: Compiled executable includes everything needed

### Security

- API keys never logged (redacted to last 4 characters in debug mode)
- Write operations require explicit configuration and flags
- All network requests use HTTPS
- Proxy support for corporate environments

## Troubleshooting

### API Key Issues

```bash
# Verify API key is set
echo $LINEAR_API_KEY

# Test with debug mode
linear-for-ai issues list --debug
```

### Permission Errors

Ensure the executable has proper permissions:

```bash
chmod +x ./dist/linear-for-ai
```

### Network Issues

If behind a proxy:

```bash
export HTTPS_PROXY=http://proxy.example.com:8080
linear-for-ai issues list
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Run tests: `deno task test`
5. Format code: `deno task fmt`
6. Commit changes: `git commit -m "feat: description"`
7. Push and create a Pull Request

### Code Style

- TypeScript strict mode
- 100 character line width
- Single quotes
- 2 space indentation
- Descriptive variable names

## Roadmap

### Current (v0.1.0)

- Issues list and show commands
- Markdown and JSON output
- Environment and config file support
- Standalone executable compilation

### Planned

- Projects commands
- Teams commands
- Cycles commands
- Write operations (create, update, delete)
- Advanced filtering and search
- Caching for improved performance

## License

MIT

## Credits

Built with:

- [Deno](https://deno.land/) - Modern JavaScript runtime
- [Linear GraphQL API](https://linear.app/developers) - Linear's API

Created for AI agents by [Ramy Nasr](https://github.com/ramynasr)
