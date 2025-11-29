import { parseArgs as denoParseArgs } from '@std/cli';
import type { GlobalOptions } from '../types/cli.ts';

export interface ParsedCommand {
  resource?: string;
  action?: string;
  args: string[];
  options: GlobalOptions & Record<string, unknown>;
  showHelp?: boolean;
  showVersion?: boolean;
}

/**
 * Parse command line arguments
 */
export function parseArgs(args: string[]): ParsedCommand {
  const parsed = denoParseArgs(args, {
    boolean: [
      'help',
      'version',
      'debug',
      'no-color',
      'dry-run',
      'allow-writes',
      'fetch-all',
      'show-all-issue-updates',
    ],
    string: ['format', 'config', 'filter', 'fields', 'cursor', 'limit', 'since'],
    alias: {
      h: 'help',
      v: 'version',
      f: 'format',
      d: 'debug',
    },
    '--': true,
  });

  const resource = parsed._[0]?.toString();
  const action = parsed._[1]?.toString();
  const commandArgs = parsed._.slice(2).map((a) => a.toString());

  // Convert limit to number if provided
  const limit = parsed.limit ? parseInt(parsed.limit, 10) : undefined;

  return {
    resource,
    action,
    args: commandArgs,
    options: {
      format: parsed.format as 'markdown' | 'json' | undefined,
      debug: parsed.debug,
      config: parsed.config,
      noColor: parsed['no-color'],
      fields: parsed.fields,
      limit,
      cursor: parsed.cursor,
      filter: parsed.filter,
      dryRun: parsed['dry-run'],
      allowWrites: parsed['allow-writes'],
      fetchAll: parsed['fetch-all'],
      since: parsed.since,
      showAllIssueUpdates: parsed['show-all-issue-updates'],
    },
    showHelp: parsed.help || (!resource && !parsed.version),
    showVersion: parsed.version,
  };
}
