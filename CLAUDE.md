# CLAUDE.md

Project rules for AI agents working on linear-for-ai.

## Project Overview

CLI tool (npm package: `linear-for-ai`) for AI agents to interact with Linear's GraphQL API directly, overcoming MCP limitations around query complexity and response control.

**Repository:** https://github.com/ramynasr/linear-for-ai (private initially, public later)

## Core Principles

**API Integration:**
- Use @linear/sdk as primary interface
- Fallback to direct GraphQL internally when SDK limitations found
- Raw GraphQL NOT exposed as CLI command yet (internal use only)
- API key from `LINEAR_API_KEY` environment variable or .env file

**Output Design:**
- Default: Terminal-optimized markdown (aligned columns, no colors in regular output)
- Alternative: JSON via `--format=json`
- MUST include web URLs for all objects
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
├── packages/cli/        # Main CLI package
├── docs/               # User documentation (versioned)
├── internal-docs/      # Design docs (git-ignored)
├── .env.example        # Example environment variables
├── pnpm-workspace.yaml
└── package.json        # Root workspace config
```

**Executable:** `linear-for-ai` (via bin entry in packages/cli/package.json)

## Directory Rules

**Versioned (commit these):**
- `./packages/` - All source packages
- `./docs/` - User documentation
- `./.env.example` - Example environment variables
- `./CLAUDE.md` - This file
- `./README.md`, `./LICENSE`

**Ignored (never commit):**
- `./internal-docs/` - Design docs, plans, transient artifacts
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
linear-for-ai projects show <id>
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
- `defaults.fields` - Field selection per resource (MUST include "url")

**NEVER store API keys in config.json** - always use environment variables.

## Write Operations

Default behavior (no flags):
1. Compute planned changes
2. Output preview
3. Exit with "Run with --yes to execute"

With `--yes` flag:
1. Check `allowWrites` config (must be true)
2. Execute operation
3. Output confirmation with URL

## Security

**API Key Handling:**
- Read from environment variable or .env file
- Never log in full
- Debug mode shows: `LINEAR_...xyz` (last 4 chars)
- Redact from headers, request bodies, error messages

**Proxy Support:**
- Respect HTTPS_PROXY / HTTP_PROXY env vars
- Config file proxy settings override env vars
- All API requests must go through configured proxy

## Output Formatting

**Terminal Markdown:**
- Tables with fixed-width columns and padding for alignment
- Calculate column widths dynamically or use sensible defaults
- Truncate long values with "..." suffix
- Use ASCII borders (|, -, +) for compatibility
- NO ANSI colors in regular output
- Colors OK for help and debug messages only

**Web URLs:**
- ALWAYS include web URL for objects in both markdown and JSON output
- Format: `https://linear.app/team/issue/ENG-123`
- Include in default field selections

## Development Workflow

**Before implementing:**
- Check design document in `./internal-docs/design.md`
- Use TodoWrite for task tracking
- Validate design decisions before coding

**Code style:**
- TypeScript strict mode
- ESM modules
- Descriptive variable names
- Comments for complex logic only

**Testing:**
- Write unit tests for pure functions
- Use fixtures for integration tests
- Mock external API calls in unit tests

## Common Pitfalls

**Don't:**
- Commit files in `./internal-docs/`
- Commit `.env` file
- Log API keys without redaction
- Allow writes by default
- Use ANSI colors in regular output
- Expose raw GraphQL commands yet (internal only)
- Store API keys in config.json

**Do:**
- Use `dotenv` for .env file support
- Include web URLs in all object outputs
- Format tables for terminal display
- Validate all user inputs
- Handle pagination explicitly
- Format errors in both human and structured forms
- Test against recorded fixtures first
- Respect proxy configuration

## References

- Design: `./internal-docs/design.md`
- Linear SDK: https://github.com/linear/linear/blob/master/packages/sdk/src/_generated_sdk.ts
- GraphQL Schema: https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql
- API Docs: https://linear.app/developers/graphql
- Repository: https://github.com/ramynasr/linear-for-ai
