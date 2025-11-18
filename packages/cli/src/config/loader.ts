import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { config as loadEnv } from 'dotenv';
import { Config, EnvironmentConfig } from './types.js';
import { DEFAULT_CONFIG } from './defaults.js';

export class ConfigLoader {
  private static DEFAULT_CONFIG_PATH = join(
    homedir(),
    '.config',
    'linear-for-ai',
    'config.json'
  );

  static loadEnvironment(): EnvironmentConfig {
    // Load .env file if it exists
    loadEnv();

    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error(
        'LINEAR_API_KEY environment variable is required. ' +
        'Set it in your shell or create a .env file.'
      );
    }

    return {
      apiKey,
      configPath: process.env.LINEAR_CONFIG,
      httpsProxy: process.env.HTTPS_PROXY,
      httpProxy: process.env.HTTP_PROXY,
    };
  }

  static async loadConfig(customPath?: string): Promise<Config> {
    const configPath = customPath || this.DEFAULT_CONFIG_PATH;

    if (!existsSync(configPath)) {
      return { ...DEFAULT_CONFIG };
    }

    try {
      const content = await readFile(configPath, 'utf-8');
      const userConfig = JSON.parse(content);

      // Deep merge user config with defaults
      return this.mergeConfig(DEFAULT_CONFIG, userConfig);
    } catch (error) {
      throw new Error(
        `Failed to load config from ${configPath}: ${(error as Error).message}`
      );
    }
  }

  private static mergeConfig(defaults: Config, user: Partial<Config>): Config {
    return {
      allowWrites: user.allowWrites ?? defaults.allowWrites,
      proxy: {
        enabled: user.proxy?.enabled ?? defaults.proxy.enabled,
        url: user.proxy?.url ?? defaults.proxy.url,
      },
      defaults: {
        format: user.defaults?.format ?? defaults.defaults.format,
        limit: user.defaults?.limit ?? defaults.defaults.limit,
        fields: {
          issue: user.defaults?.fields?.issue ?? defaults.defaults.fields.issue,
          project: user.defaults?.fields?.project ?? defaults.defaults.fields.project,
          cycle: user.defaults?.fields?.cycle ?? defaults.defaults.fields.cycle,
        },
      },
      cache: {
        enabled: user.cache?.enabled ?? defaults.cache.enabled,
        ttl: user.cache?.ttl ?? defaults.cache.ttl,
      },
    };
  }

  static applyProxyFromEnvironment(config: Config, env: EnvironmentConfig): Config {
    const proxyUrl = env.httpsProxy || env.httpProxy;

    if (proxyUrl && !config.proxy.enabled) {
      return {
        ...config,
        proxy: {
          enabled: true,
          url: proxyUrl,
        },
      };
    }

    return config;
  }
}
