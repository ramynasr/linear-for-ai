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

export interface CommandContext {
  config: Config;
  env: Environment;
  options: Record<string, unknown>;
  args: string[];
}
