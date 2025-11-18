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

## Commands

### Global Options

- `--format <format>` - Output format: `markdown` (default) or `json`
- `--debug` - Enable debug mode with request/response logging
- `--config <path>` - Custom config file path
- `--no-color` - Disable ANSI colors in output

### Issues

```bash
# List issues
linear-for-ai issues list

# List with custom page size
linear-for-ai issues list --limit 20

# Use pagination cursor
linear-for-ai issues list --cursor <cursor-value>

# Fetch all pages at once
linear-for-ai issues list --fetch-all

# Show specific issue
linear-for-ai issues show ENG-123

# JSON output
linear-for-ai --format json issues show ENG-123
```

### Projects

```bash
# List projects
linear-for-ai projects list

# Show specific project
linear-for-ai projects show <project-id>

# List with pagination
linear-for-ai projects list --limit 10 --cursor <cursor-value>
```

### Cycles

```bash
# List all cycles
linear-for-ai cycles list

# Show specific cycle
linear-for-ai cycles show <cycle-id>

# Show current active cycle
linear-for-ai cycles current

# Show current cycle for specific team
linear-for-ai cycles current --team <team-id>
```

### Teams

```bash
# List all teams
linear-for-ai teams list
```

## Output Formats

### Markdown (Default)

Human-readable output with headers and ASCII tables:

```
## Issues (25 results)

ID        Title              Status        Assignee  Priority  URL
--------  -----------------  ------------  --------  --------  -----------------------------------------
ENG-123   Fix login bug      In Progress   John      High      https://linear.app/team/issue/ENG-123
ENG-124   Add new feature    Todo          Jane      Medium    https://linear.app/team/issue/ENG-124
...
```

### JSON

Machine-parsable JSON output:

```json
{
  "data": {
    "items": [
      {
        "id": "ENG-123",
        "title": "Fix login bug",
        "status": "In Progress",
        "assignee": "John",
        "priority": "High",
        "url": "https://linear.app/team/issue/ENG-123"
      }
    ],
    "pagination": {
      "hasNextPage": true,
      "endCursor": "abc123"
    }
  }
}
```

## Pagination

The CLI supports three pagination modes:

1. **Default** - Fetch one page (default limit: 50)
2. **Custom page size** - Use `--limit N` to fetch N items
3. **Fetch all** - Use `--fetch-all` to automatically fetch all pages

Example workflow:

```bash
# Get first page
linear-for-ai issues list --limit 10
# Output includes: "Use --cursor=abc123 for next page"

# Get next page
linear-for-ai issues list --limit 10 --cursor abc123

# Or fetch everything at once
linear-for-ai issues list --fetch-all
```

## Debug Mode

Enable debug mode to see detailed request/response information:

```bash
linear-for-ai --debug issues list
```

Debug output includes:
- Request headers (API keys are redacted)
- Request body (GraphQL query)
- Response status and body
- Timing information

See [documentation](../../docs/) for full details.
