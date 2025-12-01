/**
 * CLI command and option type definitions
 */

import type { Config, Environment } from './config.ts';

export interface GlobalOptions {
  format?: 'markdown' | 'json';
  debug?: boolean;
  config?: string;
  noColor?: boolean;
  fields?: string;
}

export interface ListOptions extends GlobalOptions {
  filter?: string;
  limit?: number;
  cursor?: string;
  fetchAll?: boolean;
}

export interface ShowOptions extends GlobalOptions {
  fields?: string;
}

export interface WriteOptions extends GlobalOptions {
  dryRun?: boolean;
  allowWrites?: boolean;
}

/**
 * Context passed to all command handlers containing configuration,
 * environment, parsed options, and positional arguments.
 *
 * @template TOptions - The specific options type for the command (e.g., ListOptions, ShowOptions)
 */
export interface CommandContext<TOptions = Record<string, unknown>> {
  /** Application configuration from config file */
  config: Config;
  /** Environment variables and API credentials */
  env: Environment;
  /** Parsed command-line options (e.g., --format, --debug, --filter) */
  options: TOptions;
  /** Positional arguments after the command (e.g., issue ID for show commands) */
  args: string[];
}
