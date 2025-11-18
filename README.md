# linear-for-ai

CLI tool for AI agents to interact with Linear's GraphQL API directly.

## Status

**Phase 1 (Foundation):** ✅ Complete
- Project setup with pnpm workspace
- Configuration management
- Linear SDK client wrapper
- Error handling system
- CLI framework

**Phase 2 (Read Operations):** ✅ Complete
- Issues: list, show
- Projects: list, show
- Cycles: list, show, current
- Teams: list
- Markdown and JSON output formats
- Pagination support

**Phase 3 (Advanced Queries):** 📋 Planned
**Phase 4 (Write Operations):** 📋 Planned

## Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Linear API key ([get one here](https://linear.app/settings/api))

### Installation (Development)

```bash
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
```

### Test Connection

```bash
# Test your Linear API connection
node packages/cli/dist/cli.js test-connection

# With debug mode
node packages/cli/dist/cli.js --debug test-connection
```

## Usage Examples

```bash
# List issues
node packages/cli/dist/cli.js issues list

# Show specific issue
node packages/cli/dist/cli.js issues show ENG-123

# List projects
node packages/cli/dist/cli.js projects list

# Show project details
node packages/cli/dist/cli.js projects show <project-id>

# Show current cycle
node packages/cli/dist/cli.js cycles current

# List all cycles
node packages/cli/dist/cli.js cycles list

# List teams
node packages/cli/dist/cli.js teams list

# Output as JSON
node packages/cli/dist/cli.js --format json issues list

# Pagination
node packages/cli/dist/cli.js issues list --limit 10
node packages/cli/dist/cli.js issues list --cursor abc123

# Fetch all pages
node packages/cli/dist/cli.js issues list --fetch-all
```

## Project Structure

```
linear-for-ai/
├── packages/cli/          # Main CLI package
├── docs/                  # Documentation
├── internal-docs/         # Design docs (git-ignored)
└── docs/plans/            # Implementation plans
```

## Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [Design Document](internal-docs/design.md)
- [Implementation Plans](docs/plans/)

## License

MIT
