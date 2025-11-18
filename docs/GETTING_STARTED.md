# Getting Started with linear-for-ai

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Linear API Key** - [Generate here](https://linear.app/settings/api)

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/ramynasr/linear-for-ai.git
cd linear-for-ai
pnpm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API key
nano .env
```

Your `.env` file should contain:

```
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Build and Test

```bash
# Build the CLI
pnpm build

# Test connection to Linear
node packages/cli/dist/cli.js test-connection
```

You should see: ✓ Successfully connected to Linear API

### 4. Debug Mode

```bash
# Enable debug logging
node packages/cli/dist/cli.js --debug test-connection
```

Debug mode shows:
- Request headers (with redacted API keys)
- Request body
- Response status and body
- Timing information

## Configuration File

Create `~/.config/linear-for-ai/config.json`:

```json
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
```

See [design document](../internal-docs/design.md) for all configuration options.

## Available Commands

### Issues

```bash
# List all issues (with pagination)
node packages/cli/dist/cli.js issues list

# List issues with custom limit
node packages/cli/dist/cli.js issues list --limit 20

# Fetch all issues (all pages)
node packages/cli/dist/cli.js issues list --fetch-all

# Show specific issue by identifier
node packages/cli/dist/cli.js issues show ENG-123
```

### Projects

```bash
# List all projects
node packages/cli/dist/cli.js projects list

# Show specific project
node packages/cli/dist/cli.js projects show <project-id>
```

### Cycles

```bash
# List all cycles
node packages/cli/dist/cli.js cycles list

# Show specific cycle
node packages/cli/dist/cli.js cycles show <cycle-id>

# Show current active cycle
node packages/cli/dist/cli.js cycles current

# Show current cycle for specific team
node packages/cli/dist/cli.js cycles current --team <team-id>
```

### Teams

```bash
# List all teams
node packages/cli/dist/cli.js teams list
```

### Output Formats

```bash
# Default markdown output (human-readable tables)
node packages/cli/dist/cli.js issues list

# JSON output (for machine parsing)
node packages/cli/dist/cli.js --format json issues list
```

### Pagination

```bash
# Set page size
node packages/cli/dist/cli.js issues list --limit 10

# Use cursor for next page
node packages/cli/dist/cli.js issues list --cursor abc123

# Fetch all pages at once
node packages/cli/dist/cli.js issues list --fetch-all
```

## Next Steps

- **Phase 3:** Advanced queries and filtering
- **Phase 4:** Write operations with confirmation

See [implementation plans](plans/) for detailed roadmap.
