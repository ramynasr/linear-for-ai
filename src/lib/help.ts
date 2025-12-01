export const HELP_TEXT = `
linear-for-ai - CLI tool for AI agents to interact with Linear

USAGE:
  linear-for-ai <resource> <action> [options]

RESOURCES:
  issues          Manage and query issues
  projects        Manage and query projects
  teams           View team information
  cycles          View cycle information
  notifications   Query user notifications

COMMON COMMANDS:
  linear-for-ai issues list [--filter <filter>] [--limit N] [--fetch-all]
  linear-for-ai issues show <id>
  linear-for-ai projects list [--filter <filter>] [--fetch-all]
  linear-for-ai projects show <id>
  linear-for-ai teams list
  linear-for-ai notifications list [--limit N]

GLOBAL OPTIONS:
  --format <markdown|json>  Output format (default: markdown)
  --fetch-all               Show all resources (default: only related to you)
  --filter <json>           Filter results using Linear's filter syntax
  --limit <number>          Maximum results per page (default: 50)
  --debug                   Show debug information
  --config <path>           Custom config file path
  --no-color                Disable ANSI colors
  --fields <fields>         Override default field selection
  -h, --help               Show this help message
  -v, --version            Show version information

FILTERING BEHAVIOR:
  By default, all list commands show only resources related to you.
  Use --fetch-all to see all resources in your workspace.

EXAMPLES:
  # List your issues in progress
  linear-for-ai issues list --filter '{"state":{"type":{"eq":"started"}}}'

  # List ALL issues (workspace-wide)
  linear-for-ai issues list --fetch-all

  # Show issue detail
  linear-for-ai issues show ENG-123

  # List your projects
  linear-for-ai projects list

  # List all workspace teams
  linear-for-ai teams list --fetch-all

  # List recent notifications
  linear-for-ai notifications list --limit 10

CONFIGURATION:
  Set LINEAR_API_KEY environment variable or create .env file.
  Config file: ~/.config/linear-for-ai/config.json

For more information: https://github.com/ramynasr/linear-for-ai
`;

import denoConfig from '../../deno.json' with { type: 'json' };

export const VERSION = denoConfig.version;
