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
