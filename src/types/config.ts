/**
 * Configuration and environment type definitions
 */

export interface Config {
  allowWrites: boolean;
  proxy: ProxyConfig;
  defaults: DefaultsConfig;
  cache: CacheConfig;
}

export interface ProxyConfig {
  enabled: boolean;
  url?: string;
}

export interface DefaultsConfig {
  format: OutputFormat;
  limit: number;
  fields: FieldsConfig;
}

export interface FieldsConfig {
  issues: string[];
  projects: string[];
  'projects list': string[];
  teams: string[];
  cycles: string[];
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
}

export type OutputFormat = 'markdown' | 'json';

export interface Environment {
  apiKey: string;
  configPath?: string;
  httpsProxy?: string;
  httpProxy?: string;
}

export const DEFAULT_CONFIG: Config = {
  allowWrites: false,
  proxy: {
    enabled: false,
  },
  defaults: {
    format: 'markdown',
    limit: 50,
    fields: {
      issues: ['id', 'identifier', 'title', 'state', 'assignee', 'priority', 'createdAt', 'url'],
      projects: ['id', 'name', 'progress', 'startDate', 'targetDate', 'url'],
      'projects list': ['id', 'name', 'url'],
      teams: ['id', 'key', 'name', 'url'],
      cycles: ['id', 'number', 'name', 'startsAt', 'endsAt', 'url'],
    },
  },
  cache: {
    enabled: true,
    ttl: 300,
  },
};
