/**
 * macOS Keychain integration for secure API key storage
 */

const DEFAULT_SERVICE = 'linear-for-ai';
const DEFAULT_ACCOUNT = 'api-key';

/**
 * Check if Keychain is available (macOS only)
 */
export function isKeychainAvailable(): boolean {
  return Deno.build.os === 'darwin';
}

/**
 * Read API key from macOS Keychain
 * @returns The API key if found, null otherwise
 */
export async function readFromKeychain(
  service: string = DEFAULT_SERVICE,
  account: string = DEFAULT_ACCOUNT,
): Promise<string | null> {
  if (!isKeychainAvailable()) {
    return null;
  }

  try {
    const cmd = new Deno.Command('security', {
      args: ['find-generic-password', '-s', service, '-a', account, '-w'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout } = await cmd.output();

    // Exit code 44 = errSecItemNotFound (key doesn't exist)
    // Any other non-zero = error
    if (code !== 0) {
      return null;
    }

    const password = new TextDecoder().decode(stdout).trim();
    return password || null;
  } catch {
    // Handle spawn failures (e.g., security command not in PATH)
    return null;
  }
}

/**
 * Write API key to macOS Keychain
 * @param apiKey The API key to store
 * @throws Error if write fails
 */
export async function writeToKeychain(
  apiKey: string,
  service: string = DEFAULT_SERVICE,
  account: string = DEFAULT_ACCOUNT,
): Promise<void> {
  if (!isKeychainAvailable()) {
    throw new Error('Keychain is only available on macOS');
  }

  // -U flag: update if exists, create if not
  const cmd = new Deno.Command('security', {
    args: ['add-generic-password', '-s', service, '-a', account, '-w', apiKey, '-U'],
    stdout: 'piped',
    stderr: 'piped',
  });

  const { code, stderr } = await cmd.output();

  if (code !== 0) {
    const errorMsg = new TextDecoder().decode(stderr).trim();
    throw new Error(`Failed to write to Keychain: ${errorMsg || 'Unknown error'}`);
  }
}
