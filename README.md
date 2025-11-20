# linear-for-ai

CLI tool for AI agents to interact with Linear's GraphQL API.

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

## Configuration

Create `.env` file with your Linear API key:

```bash
LINEAR_API_KEY=your_api_key_here
```

Get your API key from Linear Settings → API → Personal API Keys.

## Usage

```bash
# List issues
linear-for-ai issues list

# Show specific issue
linear-for-ai issues show ENG-123

# List projects
linear-for-ai projects list
```

## Development

```bash
# Run in dev mode
deno task dev issues list

# Run tests
deno task test

# Format code
deno task fmt

# Lint code
deno task lint
```

## License

MIT
