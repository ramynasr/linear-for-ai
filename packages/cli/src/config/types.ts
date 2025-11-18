export interface ProxyConfig {
  enabled: boolean;
  url?: string;
}

export interface FieldDefaults {
  issue: string[];
  project: string[];
  cycle: string[];
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
}

export interface ConfigDefaults {
  format: 'markdown' | 'json';
  limit: number;
  fields: FieldDefaults;
}

export interface Config {
  allowWrites: boolean;
  proxy: ProxyConfig;
  defaults: ConfigDefaults;
  cache: CacheConfig;
}

export interface EnvironmentConfig {
  apiKey: string;
  configPath?: string;
  httpsProxy?: string;
  httpProxy?: string;
}
