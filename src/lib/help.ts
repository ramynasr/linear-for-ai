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
  linear-for-ai issues list [--filter <filter>] [--limit N]
  linear-for-ai issues show <id>
  linear-for-ai projects list
  linear-for-ai projects show <id>
  linear-for-ai teams list
  linear-for-ai notifications list [--limit N]

GLOBAL OPTIONS:
  --format <markdown|json>  Output format (default: markdown)
  --debug                   Show debug information
  --config <path>           Custom config file path
  --no-color                Disable ANSI colors
  --fields <fields>         Override default field selection
  -h, --help               Show this help message
  -v, --version            Show version information

EXAMPLES:
  # List issues in progress
  linear-for-ai issues list --filter 'status:in_progress'

  # Show issue detail
  linear-for-ai issues show ENG-123

  # List all projects in JSON format
  linear-for-ai projects list --format json

  # List recent notifications (last 30 days)
  linear-for-ai notifications list --limit 10

CONFIGURATION:
  Set LINEAR_API_KEY environment variable or create .env file.
  Config file: ~/.config/linear-for-ai/config.json

For more information: https://github.com/ramynasr/linear-for-ai
`;

export const VERSION = '0.1.0';
