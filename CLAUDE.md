# CLAUDE.md

Project rules for AI agents working on linear-for-ai.

## Project Overview

CLI tool for AI agents to interact with Linear's GraphQL API directly, overcoming MCP limitations around query complexity and response control.

**Repository:** https://github.com/ramynasr/linear-for-ai

## Core Principles

**Build Process**
- ALWAYS aim for one self-contained and portable executable that can be distributed and used on Mac OS without requiring other dependencies.

**API Integration:**
- Use direct GraphQL to query Linear's API
- Check Linear's GraphQL Schema (`./docs/linear-docs/schema.graphql`) before building or modifying commands; look for optimization opportunities
- Raw GraphQL NOT exposed as CLI command yet (internal use only)
- API key from `LINEAR_API_KEY` environment variable or .env file

**Output Design:**
- Default: Terminal-optimized markdown (aligned columns, no colors in regular output)
- Alternative: JSON via `--format=json`
- Include web URLs when listing objects
- Minimize tokens while maintaining clarity
- Colors allowed only for help text and debug output

**Safety:**
- Read operations execute without confirmation
- Write operations require preview-then-confirm workflow
- Global `allowWrites` config defaults to `false`
- All `--debug` output MUST redact API keys (show last 4 chars only)

**Testing:**
- Unit tests use mocks
- Integration tests use recordings or sandbox API
- Never commit real API keys or workspace data

## Package Structure

**pnpm workspace:**
```
linear-for-ai/
├── docs/               # User documentation (versioned)
├── internal-docs/      # Design, Planning, and all transient docs (git-ignored)
├── .env.example        # Example environment variables
```

**Executable:** `linear-for-ai`

## Directory Rules

**Versioned (commit these):**
- `./docs/` - User documentation
- `./.env.example` - Example environment variables
- `./CLAUDE.md` - This file
- `./README.md`, `./LICENSE`

**Ignored (never commit):**
- `./internal-docs/` - Design docs, plans, debugging artifacts (store superpowers outputs under `./internal-docs/{design,plan,debugging}`)
- `./node_modules/` - Dependencies
- `./.env` - Environment variables with secrets
- Any files with real API keys or workspace identifiers

## Command Structure

Resource-based CLI:
```bash
linear-for-ai <resource> <action> [options]
```

Common patterns:
```bash
linear-for-ai issues list --filter 'status:in_progress'
linear-for-ai projects show <idOrUrl>
linear-for-ai cycles current
```

Note: Raw GraphQL query commands NOT exposed yet (future iteration).

## Configuration

**Environment Variables (.env or shell):**
Required:
- `LINEAR_API_KEY` - Personal API key

Optional:
- `LINEAR_CONFIG` - Override config file path
- `HTTPS_PROXY` / `HTTP_PROXY` - Proxy for API requests

**Config File:** `~/.config/linear-for-ai/config.json`

Key fields:
- `allowWrites` - Boolean, defaults false
- `proxy.enabled` / `proxy.url` - Proxy configuration
- `defaults.format` - Output format (markdown or json)
- `defaults.limit` - Pagination limit (default 50)
- `defaults.fields` - Field selection per resource (possibility to override the resource field selection for specific actions for that resource)

**NEVER store API keys in config.json** - always use environment variables.

## Write Operations

Default behavior (no flags):
1. Compute planned changes
2. Output preview
3. Exit with "Run with --allow-writes to execute"

With `--allow-writes` flag:
1. Check `allowWrites` config (must be true)
2. Execute operation
3. Output confirmation with URL

## Security

**API Key Handling:**
- Read from environment variable or .env file
- Never log in full
- Debug mode shows: `LINEAR_...xyz` (last 4 chars)
- Redact from headers, request bodies, error messages
- Look for exact match of the API key string in any debugging or error output and redact it.

**Proxy Support:**
- Respect HTTPS_PROXY / HTTP_PROXY env vars
- Config file proxy settings override env vars
- All API requests must go through configured proxy

## Output Formatting

**Terminal Markdown:**
- Tables with fixed-width columns and padding for alignment
- Calculate column widths dynamically or use sensible defaults
- Truncate values longer than 250 characters with "..." suffix.
- NEVER truncate IDs, slugs, or URLs
- ALL output MUST be markdown compliant
- NO ANSI colors in regular output
- Colors OK for help and debug messages only

**Web URLs:**
- ALWAYS include web URL for objects in both markdown and JSON output when showing a list
- Format: `https://linear.app/team/issue/ENG-123`
- Include in default field selections

## Development Workflow

**Before implementing:**
- Check design document in `./internal-docs/design.md`
- Use TodoWrite for task tracking
- Validate design decisions before coding

**Code style:**
- TypeScript strict mode
- Descriptive variable names
- Whenever applicable, aim for making multiple API calls in parallel for better performance

**Testing:**
- Write unit tests for pure functions
- Use fixtures for integration tests
- Mock external API calls in unit tests

## Git Workflow

**Worktrees:**
- Use worktrees for new work
- When in a worktree, verify changes relate to its purpose
- Confirm with user if changes are unrelated to current worktree

**Code Review:**
- Request code review via superpowers before merging any worktree

## Common Pitfalls

**Don't:**
- Commit files in `./internal-docs/`
- Commit `.env` file
- Log API keys without redaction
- Allow writes by default
- Use ANSI colors in regular output
- Store API keys in config.json
- Push to remote or create tags without explicit user instructions

## References

- Design: `./internal-docs/design.md`
- GraphQL Schema: `./docs/linear-docs/schema.graphql`
- API Docs: https://linear.app/developers/graphql
- Repository: https://github.com/ramynasr/linear-for-ai
