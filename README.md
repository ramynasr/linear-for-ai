# linear-for-ai

CLI for AI agents to interact with Linear's GraphQL API.

## Overview

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

Download from the [releases page](https://github.com/ramynasr/linear-for-ai/releases):

```bash
curl -L https://github.com/ramynasr/linear-for-ai/releases/latest/download/linear-for-ai-{PLATFORM} -o linear-for-ai
chmod +x linear-for-ai
sudo mv linear-for-ai /usr/local/bin/
```

Replace `{PLATFORM}` with `macos-x64`, `macos-arm64`, `linux-x64`, or `linux-arm64`.

### From Source

```bash
git clone https://github.com/ramynasr/linear-for-ai.git
cd linear-for-ai
deno task compile
cp ./dist/linear-for-ai /usr/local/bin/
```

## Configuration

Set your API key (get from Linear Settings > API > Personal API Keys):

```bash
export LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Optional config file at `~/.config/linear-for-ai/config.json`:

```json
{
  "allowWrites": false,
  "defaults": { "format": "markdown", "limit": 50 }
}
```

See [docs/configuration.md](docs/configuration.md) for all options.

## Usage

### Issues

```bash
linear-for-ai issues list                    # Your issues
linear-for-ai issues list --fetch-all        # All workspace issues
linear-for-ai issues show ENG-123            # Show specific issue
```

### Projects

```bash
linear-for-ai projects list                  # Your projects (excludes completed)
linear-for-ai projects list --show-completed # Include completed
linear-for-ai projects show PROJECT-ID       # Show project details
linear-for-ai projects show-updates --since 2025-01-01
```

### Initiatives

```bash
linear-for-ai initiatives list               # Your initiatives
linear-for-ai initiatives show abc123def456  # Show initiative details
```

### Notifications

```bash
linear-for-ai notifications list             # Recent notifications
linear-for-ai notifications list --limit 10  # Limit results
```

### Global Options

```
--format <markdown|json>   Output format (default: markdown)
--fetch-all                Show all resources, not just yours
--filter <json>            Filter using Linear's filter syntax
--fields <fields>          Override field selection
--limit <N>                Pagination limit (default: 50)
--debug                    Show API calls
-h, --help                 Show help
-v, --version              Show version
```

### Filtering Behavior

By default, list commands show only resources related to you. Use `--fetch-all` to see all resources in your workspace.

## Troubleshooting

- **API key not working?** Run with `--debug` to verify
- **Permission errors?** Run `chmod +x linear-for-ai`
- **Behind proxy?** Set `HTTPS_PROXY=http://proxy.example.com:8080`

## Development

See [docs/development.md](docs/development.md) for development setup, building, testing, and contributing.

## License

MIT
