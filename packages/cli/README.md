# linear-for-ai

CLI tool for AI agents to interact with Linear GraphQL API.

## Installation

```bash
npm install -g linear-for-ai
# or
pnpm add -g linear-for-ai
```

## Configuration

Set your Linear API key:

```bash
export LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Or create a `.env` file in your project root.

## Usage

```bash
# Test connection
linear-for-ai test-connection

# Show help
linear-for-ai --help

# Debug mode
linear-for-ai --debug test-connection
```

## Commands (Coming Soon)

- `linear-for-ai issues list` - List issues
- `linear-for-ai issues show <id>` - Show issue details
- `linear-for-ai projects list` - List projects
- `linear-for-ai cycles current` - Show current cycle

See [documentation](../../docs/) for full details.
