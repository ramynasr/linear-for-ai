/**
 * Interactive setup for API key configuration
 */

import { isKeychainAvailable, writeToKeychain } from './keychain.ts';

/**
 * Check if running in an interactive terminal
 */
export function isInteractive(): boolean {
  try {
    return Deno.stdin.isTerminal();
  } catch {
    return false;
  }
}

/**
 * Validate API key format
 * @returns Object with valid flag and optional warning
 */
export function validateApiKeyFormat(apiKey: string): { valid: boolean; warning?: string } {
  const trimmed = apiKey.trim();

  if (!trimmed) {
    return { valid: false };
  }

  if (!trimmed.startsWith('lin_api_')) {
    return {
      valid: true,
      warning: 'Warning: API key does not match expected format (lin_api_...). Continuing anyway.',
    };
  }

  return { valid: true };
}

/**
 * Write API key to .env file
 * @param apiKey The API key to store
 * @param envPath Path to .env file (defaults to ./.env)
 */
export async function writeToEnvFile(apiKey: string, envPath: string = '.env'): Promise<void> {
  let content = '';

  try {
    content = await Deno.readTextFile(envPath);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    // File doesn't exist, will create new
  }

  // Check if LINEAR_API_KEY already exists
  const keyRegex = /^LINEAR_API_KEY=.*/m;
  if (keyRegex.test(content)) {
    // Replace existing key
    content = content.replace(keyRegex, `LINEAR_API_KEY=${apiKey}`);
  } else {
    // Append new key
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    content += `LINEAR_API_KEY=${apiKey}\n`;
  }

  await Deno.writeTextFile(envPath, content);
}

/**
 * Restore terminal echo - used in finally blocks
 */
async function restoreEcho(): Promise<void> {
  try {
    const cmd = new Deno.Command('stty', { args: ['echo'], stdin: 'null' });
    await cmd.output();
  } catch {
    // Ignore if stty not available
  }
}

/**
 * Prompt user for input (hidden for passwords)
 * Uses larger buffer and proper error handling for stdin
 */
async function promptInput(message: string, hidden: boolean = false): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (message) {
    await Deno.stdout.write(encoder.encode(message));
  }

  let echoDisabled = false;

  if (hidden) {
    // Try to disable echo for hidden input
    try {
      const cmd = new Deno.Command('stty', { args: ['-echo'], stdin: 'null' });
      const result = await cmd.output();
      echoDisabled = result.code === 0;

      if (!echoDisabled) {
        // Warn user that input may be visible
        await Deno.stdout.write(
          encoder.encode('\n(Warning: Could not hide input - your API key may be visible)\n'),
        );
      }
    } catch {
      // stty not available - warn user
      await Deno.stdout.write(
        encoder.encode('\n(Warning: Could not hide input - your API key may be visible)\n'),
      );
    }
  }

  try {
    // Use larger buffer to handle long API keys (4096 bytes)
    const buf = new Uint8Array(4096);
    const n = await Deno.stdin.read(buf);

    // Handle EOF/stdin closed
    if (n === null) {
      throw new Error('Setup cancelled (stdin closed)');
    }

    const input = decoder.decode(buf.subarray(0, n)).trim();
    return input;
  } finally {
    // Always restore echo if we disabled it (even on error)
    if (hidden && echoDisabled) {
      await restoreEcho();
      await Deno.stdout.write(encoder.encode('\n'));
    }
  }
}

/**
 * Prompt user for storage choice with input validation
 * @returns 'keychain' | 'env'
 */
async function promptStorageChoice(): Promise<'keychain' | 'env'> {
  const encoder = new TextEncoder();

  if (isKeychainAvailable()) {
    // Loop until valid input on macOS
    while (true) {
      await Deno.stdout.write(
        encoder.encode(`
Where would you like to store your API key?
[1] macOS Keychain (recommended)
[2] .env file in current directory

Enter choice (1 or 2): `),
      );

      const choice = (await promptInput('')).trim();

      if (choice === '1') {
        return 'keychain';
      }
      if (choice === '2') {
        return 'env';
      }

      await Deno.stdout.write(encoder.encode('\nInvalid choice. Please enter 1 or 2.\n'));
    }
  } else {
    // Loop until valid input on non-macOS
    while (true) {
      await Deno.stdout.write(encoder.encode('\nStore API key in .env file? (y/n): '));
      const choice = (await promptInput('')).trim().toLowerCase();

      if (choice === 'y' || choice === 'yes') {
        return 'env';
      }
      if (choice === 'n' || choice === 'no') {
        throw new Error('Setup cancelled by user');
      }

      await Deno.stdout.write(encoder.encode('\nInvalid choice. Please enter y or n.\n'));
    }
  }
}

/**
 * Display scope notice for chosen storage method
 */
async function displayScopeNotice(storage: 'keychain' | 'env'): Promise<void> {
  const encoder = new TextEncoder();

  if (storage === 'keychain') {
    await Deno.stdout.write(
      encoder.encode('\nYour API key will be available system-wide for all directories.\n'),
    );
  } else {
    await Deno.stdout.write(
      encoder.encode(
        '\nNote: This .env file only works when running linear-for-ai from this directory.\n' +
          'For system-wide access, use Keychain (macOS) or add LINEAR_API_KEY to your shell profile (~/.zshrc).\n',
      ),
    );
  }
}

/**
 * Run interactive setup to configure API key
 * @returns The stored API key
 */
export async function runInteractiveSetup(): Promise<string> {
  const encoder = new TextEncoder();

  await Deno.stdout.write(encoder.encode('\nNo Linear API key found.\n'));

  // Get storage choice
  const storage = await promptStorageChoice();

  // Display scope notice
  await displayScopeNotice(storage);

  // Prompt for API key
  const apiKey = await promptInput('\nEnter your Linear API key: ', true);

  // Validate
  const validation = validateApiKeyFormat(apiKey);
  if (!validation.valid) {
    throw new Error('Invalid API key: cannot be empty');
  }
  if (validation.warning) {
    await Deno.stdout.write(encoder.encode(validation.warning + '\n'));
  }

  // Store
  try {
    if (storage === 'keychain') {
      await writeToKeychain(apiKey);
    } else {
      await writeToEnvFile(apiKey);
    }
  } catch (error) {
    // Platform-specific error message
    let altInstructions: string;
    if (storage === 'keychain') {
      altInstructions = 'Try using a .env file or add LINEAR_API_KEY to your shell profile.';
    } else if (isKeychainAvailable()) {
      altInstructions = 'Try using Keychain (macOS) or add LINEAR_API_KEY to your shell profile.';
    } else {
      altInstructions = 'Try adding LINEAR_API_KEY to your shell profile (e.g., ~/.bashrc, ~/.zshrc).';
    }

    throw new Error(
      `Failed to save API key to ${storage === 'keychain' ? 'Keychain' : '.env file'}: ${
        (error as Error).message
      }\n${altInstructions}`,
    );
  }

  await Deno.stdout.write(encoder.encode('\nAPI key saved. Continuing...\n\n'));

  return apiKey;
}
