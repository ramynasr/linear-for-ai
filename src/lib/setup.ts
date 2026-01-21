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
 * Prompt user for input (hidden for passwords)
 */
async function promptInput(message: string, hidden: boolean = false): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  await Deno.stdout.write(encoder.encode(message));

  if (hidden) {
    // Try to disable echo for hidden input
    try {
      const cmd = new Deno.Command('stty', { args: ['-echo'], stdin: 'inherit' });
      await cmd.output();
    } catch {
      // Ignore if stty not available
    }
  }

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  const input = decoder.decode(buf.subarray(0, n ?? 0)).trim();

  if (hidden) {
    // Re-enable echo and print newline
    try {
      const cmd = new Deno.Command('stty', { args: ['echo'], stdin: 'inherit' });
      await cmd.output();
    } catch {
      // Ignore if stty not available
    }
    await Deno.stdout.write(encoder.encode('\n'));
  }

  return input;
}

/**
 * Prompt user for storage choice
 * @returns 'keychain' | 'env'
 */
async function promptStorageChoice(): Promise<'keychain' | 'env'> {
  const encoder = new TextEncoder();

  if (isKeychainAvailable()) {
    await Deno.stdout.write(
      encoder.encode(`
Where would you like to store your API key?
[1] macOS Keychain (recommended)
[2] .env file in current directory

Enter choice (1 or 2): `),
    );

    const choice = await promptInput('');
    return choice === '2' ? 'env' : 'keychain';
  } else {
    await Deno.stdout.write(encoder.encode('\nStore API key in .env file? (y/n): '));
    const choice = await promptInput('');
    if (choice.toLowerCase() !== 'y' && choice.toLowerCase() !== 'yes') {
      throw new Error('Setup cancelled by user');
    }
    return 'env';
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
    const altInstructions = storage === 'keychain'
      ? 'Try using a .env file or add LINEAR_API_KEY to your shell profile.'
      : 'Try using Keychain (macOS) or add LINEAR_API_KEY to your shell profile.';

    throw new Error(
      `Failed to save API key to ${storage === 'keychain' ? 'Keychain' : '.env file'}: ${
        (error as Error).message
      }\n${altInstructions}`,
    );
  }

  await Deno.stdout.write(encoder.encode('\nAPI key saved. Continuing...\n\n'));

  return apiKey;
}
