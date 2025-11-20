import * as path from '@std/path';
import { exists } from '@std/fs';
import type { Config } from '../types/config.ts';
import { DEFAULT_CONFIG } from '../types/config.ts';

/**
 * Get the config file path from environment or default location
 */
export function getConfigPath(customPath?: string): string {
  if (customPath) return customPath;

  const envPath = Deno.env.get('LINEAR_CONFIG');
  if (envPath) return envPath;

  const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE');
  if (!homeDir) {
    throw new Error('Cannot determine home directory');
  }

  return path.join(homeDir, '.config', 'linear-for-ai', 'config.json');
}

/**
 * Deep merge two objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Load configuration from file or return defaults
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  const path = getConfigPath(configPath);

  try {
    const fileExists = await exists(path);
    if (!fileExists) {
      return DEFAULT_CONFIG;
    }

    const content = await Deno.readTextFile(path);
    const userConfig = JSON.parse(content) as Partial<Config>;

    return deepMerge(DEFAULT_CONFIG, userConfig);
  } catch (error) {
    console.error(`Warning: Failed to load config from ${path}: ${(error as Error).message}`);
    return DEFAULT_CONFIG;
  }
}
