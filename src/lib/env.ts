import { load } from '@std/dotenv';
import type { Environment } from '../types/config.ts';
import { isKeychainAvailable, readFromKeychain } from './keychain.ts';
import { isInteractive, runInteractiveSetup } from './setup.ts';

/**
 * Load environment variables from .env file and system environment
 * Falls back to macOS Keychain, then interactive setup if available
 */
export async function loadEnvironment(): Promise<Environment> {
  // Load .env file if it exists (doesn't throw if missing)
  // Don't load .env during tests if LINEAR_API_KEY is explicitly unset
  const skipDotenv = Deno.env.get('SKIP_DOTENV_LOAD') === 'true';
  if (!skipDotenv) {
    await load({ export: true, envPath: '.env' });
  }

  let apiKey = Deno.env.get('LINEAR_API_KEY');

  // Fallback 1: Try Keychain on macOS
  if (!apiKey && isKeychainAvailable()) {
    apiKey = await readFromKeychain() ?? undefined;
  }

  // Fallback 2: Interactive setup if TTY available
  const skipInteractive = Deno.env.get('SKIP_INTERACTIVE_SETUP') === 'true';
  if (!apiKey && !skipInteractive && isInteractive()) {
    apiKey = await runInteractiveSetup();
  }

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
