# macOS Keychain API Key Storage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add macOS Keychain as a secure fallback for storing the Linear API key, with interactive setup when no key is found.

**Architecture:** Three new modules: `keychain.ts` for Keychain operations via `security` CLI, `setup.ts` for interactive setup flow, and modifications to `env.ts` to integrate them. Platform detection gates Keychain operations to macOS only.

**Tech Stack:** Deno, `Deno.Command` for shell execution, `Deno.stdin.isTerminal()` for TTY detection

---

## Task 1: Create Keychain Module

**Files:**
- Create: `src/lib/keychain.ts`
- Create: `tests/lib/keychain.test.ts`

**Step 1: Write tests for keychain module**

Create `tests/lib/keychain.test.ts`:

```typescript
import { assertEquals } from '@std/assert';
import { isKeychainAvailable, readFromKeychain, writeToKeychain } from '../../src/lib/keychain.ts';

Deno.test('isKeychainAvailable - returns true on darwin', () => {
  // This test will pass on macOS, fail on other platforms
  // We test the actual platform behavior
  const expected = Deno.build.os === 'darwin';
  assertEquals(isKeychainAvailable(), expected);
});

Deno.test('readFromKeychain - returns null when key not found', async () => {
  if (Deno.build.os !== 'darwin') {
    return; // Skip on non-macOS
  }
  // Use a service name that definitely doesn't exist
  const result = await readFromKeychain('linear-for-ai-test-nonexistent', 'api-key-test');
  assertEquals(result, null);
});

Deno.test('writeToKeychain and readFromKeychain - round trip', async () => {
  if (Deno.build.os !== 'darwin') {
    return; // Skip on non-macOS
  }
  const testService = 'linear-for-ai-test';
  const testAccount = 'api-key-test';
  const testKey = 'test_key_' + Date.now();

  try {
    // Write
    await writeToKeychain(testKey, testService, testAccount);

    // Read back
    const result = await readFromKeychain(testService, testAccount);
    assertEquals(result, testKey);
  } finally {
    // Cleanup: delete the test key
    const cmd = new Deno.Command('security', {
      args: ['delete-generic-password', '-s', testService, '-a', testAccount],
      stderr: 'null',
      stdout: 'null',
    });
    await cmd.output();
  }
});
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key && deno test --allow-env --allow-read --allow-run tests/lib/keychain.test.ts`

Expected: FAIL with module not found error

**Step 3: Implement keychain module**

Create `src/lib/keychain.ts`:

```typescript
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
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key && deno test --allow-env --allow-read --allow-run tests/lib/keychain.test.ts`

Expected: PASS (3 tests on macOS, 1 pass + 2 skipped on other platforms)

**Step 5: Commit**

```bash
cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key
git add src/lib/keychain.ts tests/lib/keychain.test.ts
git commit -m "feat: add macOS Keychain module for API key storage"
```

---

## Task 2: Create Interactive Setup Module

**Files:**
- Create: `src/lib/setup.ts`
- Create: `tests/lib/setup.test.ts`

**Step 1: Write tests for setup module**

Create `tests/lib/setup.test.ts`:

```typescript
import { assertEquals } from '@std/assert';
import { isInteractive, validateApiKeyFormat, writeToEnvFile } from '../../src/lib/setup.ts';

Deno.test('isInteractive - returns boolean', () => {
  // Just verify it returns a boolean without crashing
  const result = isInteractive();
  assertEquals(typeof result, 'boolean');
});

Deno.test('validateApiKeyFormat - accepts valid key', () => {
  const result = validateApiKeyFormat('lin_api_abc123');
  assertEquals(result.valid, true);
  assertEquals(result.warning, undefined);
});

Deno.test('validateApiKeyFormat - warns on non-standard format', () => {
  const result = validateApiKeyFormat('some_other_key');
  assertEquals(result.valid, true);
  assertEquals(typeof result.warning, 'string');
});

Deno.test('validateApiKeyFormat - rejects empty key', () => {
  const result = validateApiKeyFormat('');
  assertEquals(result.valid, false);
});

Deno.test('validateApiKeyFormat - rejects whitespace-only key', () => {
  const result = validateApiKeyFormat('   ');
  assertEquals(result.valid, false);
});

Deno.test('writeToEnvFile - creates .env file', async () => {
  const tempDir = await Deno.makeTempDir();
  const envPath = `${tempDir}/.env`;

  await writeToEnvFile('test_api_key_123', envPath);

  const content = await Deno.readTextFile(envPath);
  assertEquals(content.includes('LINEAR_API_KEY=test_api_key_123'), true);

  // Cleanup
  await Deno.remove(tempDir, { recursive: true });
});

Deno.test('writeToEnvFile - appends to existing .env file', async () => {
  const tempDir = await Deno.makeTempDir();
  const envPath = `${tempDir}/.env`;

  // Create existing .env
  await Deno.writeTextFile(envPath, 'EXISTING_VAR=value\n');

  await writeToEnvFile('test_api_key_456', envPath);

  const content = await Deno.readTextFile(envPath);
  assertEquals(content.includes('EXISTING_VAR=value'), true);
  assertEquals(content.includes('LINEAR_API_KEY=test_api_key_456'), true);

  // Cleanup
  await Deno.remove(tempDir, { recursive: true });
});

Deno.test('writeToEnvFile - updates existing LINEAR_API_KEY', async () => {
  const tempDir = await Deno.makeTempDir();
  const envPath = `${tempDir}/.env`;

  // Create existing .env with old key
  await Deno.writeTextFile(envPath, 'LINEAR_API_KEY=old_key\nOTHER_VAR=value\n');

  await writeToEnvFile('new_key_789', envPath);

  const content = await Deno.readTextFile(envPath);
  assertEquals(content.includes('LINEAR_API_KEY=new_key_789'), true);
  assertEquals(content.includes('old_key'), false);
  assertEquals(content.includes('OTHER_VAR=value'), true);

  // Cleanup
  await Deno.remove(tempDir, { recursive: true });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key && deno test --allow-env --allow-read --allow-write tests/lib/setup.test.ts`

Expected: FAIL with module not found error

**Step 3: Implement setup module**

Create `src/lib/setup.ts`:

```typescript
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
    const altMethod = storage === 'keychain' ? '.env file' : 'Keychain';
    const altInstructions =
      storage === 'keychain'
        ? 'Try using a .env file or add LINEAR_API_KEY to your shell profile.'
        : 'Try using Keychain (macOS) or add LINEAR_API_KEY to your shell profile.';

    throw new Error(
      `Failed to save API key to ${storage === 'keychain' ? 'Keychain' : '.env file'}: ${(error as Error).message}\n${altInstructions}`,
    );
  }

  await Deno.stdout.write(encoder.encode('\nAPI key saved. Continuing...\n\n'));

  return apiKey;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key && deno test --allow-env --allow-read --allow-write --allow-run tests/lib/setup.test.ts`

Expected: PASS (8 tests)

**Step 5: Commit**

```bash
cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key
git add src/lib/setup.ts tests/lib/setup.test.ts
git commit -m "feat: add interactive setup module for API key configuration"
```

---

## Task 3: Integrate Keychain into Environment Loading

**Files:**
- Modify: `src/lib/env.ts`
- Modify: `tests/lib/env.test.ts`

**Step 1: Write additional tests for env module**

Add to `tests/lib/env.test.ts`:

```typescript
import { assertRejects } from '@std/assert';

Deno.test('loadEnvironment - falls back to Keychain on macOS', async () => {
  if (Deno.build.os !== 'darwin') {
    return; // Skip on non-macOS
  }

  // This test verifies the fallback logic exists
  // Full integration testing would require mocking Keychain
  const original = Deno.env.get('LINEAR_API_KEY');

  Deno.env.set('SKIP_DOTENV_LOAD', 'true');
  Deno.env.set('SKIP_INTERACTIVE_SETUP', 'true');
  Deno.env.delete('LINEAR_API_KEY');

  try {
    // Without a key in env, .env, or Keychain, should throw
    await assertRejects(
      () => loadEnvironment(),
      Error,
      'LINEAR_API_KEY',
    );
  } finally {
    Deno.env.delete('SKIP_DOTENV_LOAD');
    Deno.env.delete('SKIP_INTERACTIVE_SETUP');
    if (original) {
      Deno.env.set('LINEAR_API_KEY', original);
    }
  }
});
```

**Step 2: Run tests to verify current behavior**

Run: `cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key && deno test --allow-env --allow-read --allow-write --allow-run tests/lib/env.test.ts`

Expected: PASS (existing tests still pass)

**Step 3: Update env.ts to integrate Keychain and setup**

Modify `src/lib/env.ts`:

```typescript
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
```

**Step 4: Run all tests to verify integration**

Run: `cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key && deno test --allow-env --allow-read --allow-write --allow-run`

Expected: PASS (all tests including new ones)

**Step 5: Commit**

```bash
cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key
git add src/lib/env.ts tests/lib/env.test.ts
git commit -m "feat: integrate Keychain and interactive setup into environment loading"
```

---

## Task 4: Update Documentation

**Files:**
- Modify: `docs/configuration.md`

**Step 1: Update configuration documentation**

Modify `docs/configuration.md` to include Keychain documentation:

```markdown
# Configuration Guide

## API Key Setup

linear-for-ai requires a Linear API key. The key is loaded in this order:

1. `LINEAR_API_KEY` environment variable
2. `.env` file in current directory
3. macOS Keychain (macOS only)

If no key is found and you're running in an interactive terminal, you'll be prompted to set one up.

### Option 1: Environment Variable

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option 2: .env File

Create a `.env` file in your project root:

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** This only works when running linear-for-ai from that directory.

### Option 3: macOS Keychain (Recommended for macOS)

On first run without a configured key, you'll be prompted to store it in Keychain.

To manually add via command line:

```bash
security add-generic-password -s "linear-for-ai" -a "api-key" -w "lin_api_xxx" -U
```

Benefits:
- Secure storage (encrypted by macOS)
- Works system-wide from any directory
- No plain text files to accidentally commit

## Other Environment Variables

```bash
# Optional
LINEAR_CONFIG=/custom/path/to/config.json
HTTPS_PROXY=http://proxy.example.com:8080
HTTP_PROXY=http://proxy.example.com:8080
```

## Configuration File

Default location: `~/.config/linear-for-ai/config.json`

See `config.example.json` for full example.

### Key Settings

**allowWrites** (boolean, default: false)

- Must be `true` to execute write operations with `--allow-writes` flag

**defaults.format** (string, default: "markdown")

- Default output format: "markdown" or "json"

**defaults.limit** (number, default: 50)

- Default pagination limit for list commands

**defaults.fields** (object)

- Default field selections for each resource type
- Use dot notation for nested fields: "assignee.displayName"

## Field Selection

Override defaults with `--fields` flag:

```bash
linear-for-ai issues list --fields id,title,url
linear-for-ai issues show ENG-123 --fields id,title,description,state.name
```

## Proxy Configuration

Two ways to configure proxy:

1. Environment variables (applies to all requests):

```bash
export HTTPS_PROXY=http://proxy.example.com:8080
```

2. Config file (takes precedence):

```json
{
  "proxy": {
    "enabled": true,
    "url": "http://proxy.example.com:8080"
  }
}
```
```

**Step 2: Commit documentation update**

```bash
cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key
git add docs/configuration.md
git commit -m "docs: add Keychain API key storage documentation"
```

---

## Task 5: Final Verification

**Step 1: Run full test suite**

Run: `cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key && deno test --allow-env --allow-read --allow-write --allow-run`

Expected: All tests pass

**Step 2: Manual testing (on macOS)**

Test the interactive setup by temporarily removing your API key:

```bash
# Backup current key
export BACKUP_KEY=$LINEAR_API_KEY
unset LINEAR_API_KEY
mv .env .env.backup 2>/dev/null || true

# Run command to trigger setup
cd /Users/ramyn/Projects/ai/linear-for-ai/.worktrees/keychain-api-key
deno run --allow-env --allow-read --allow-write --allow-run --allow-net src/cli.ts teams list

# Restore
export LINEAR_API_KEY=$BACKUP_KEY
mv .env.backup .env 2>/dev/null || true
```

**Step 3: Verify Keychain integration**

```bash
# Check if key was stored in Keychain
security find-generic-password -s "linear-for-ai" -a "api-key" -w

# Delete test key if needed
security delete-generic-password -s "linear-for-ai" -a "api-key"
```

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Keychain module | `src/lib/keychain.ts`, `tests/lib/keychain.test.ts` |
| 2 | Setup module | `src/lib/setup.ts`, `tests/lib/setup.test.ts` |
| 3 | Environment integration | `src/lib/env.ts`, `tests/lib/env.test.ts` |
| 4 | Documentation | `docs/configuration.md` |
| 5 | Final verification | Manual testing |
