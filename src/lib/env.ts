import { load } from '@std/dotenv';
import type { Environment } from '../types/config.ts';

/**
 * Load environment variables from .env file and system environment
 */
export async function loadEnvironment(): Promise<Environment> {
  // Load .env file if it exists (doesn't throw if missing)
  // Don't load .env during tests if LINEAR_API_KEY is explicitly unset
  const skipDotenv = Deno.env.get('SKIP_DOTENV_LOAD') === 'true';
  if (!skipDotenv) {
    await load({ export: true, envPath: '.env' });
  }

  const apiKey = Deno.env.get('LINEAR_API_KEY');
  if (!apiKey) {
    throw new Error('LINEAR_API_KEY environment variable is required');
  }

  return {
    apiKey,
    configPath: Deno.env.get('LINEAR_CONFIG'),
    httpsProxy: Deno.env.get('HTTPS_PROXY'),
    httpProxy: Deno.env.get('HTTP_PROXY'),
  };
}

/**
 * Redact API key for debug output (show last 4 characters)
 */
export function redactApiKey(apiKey: string): string {
  if (apiKey.length <= 4) return '***';
  return `LINEAR_...${apiKey.slice(-4)}`;
}
