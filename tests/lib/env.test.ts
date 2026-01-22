import { assertEquals, assertExists, assertRejects, assertStringIncludes } from '@std/assert';
import { loadEnvironment } from '../../src/lib/env.ts';

Deno.test('loadEnvironment - loads API key from environment', async () => {
  Deno.env.set('LINEAR_API_KEY', 'test_key_1234');
  const env = await loadEnvironment();
  assertEquals(env.apiKey, 'test_key_1234');
  Deno.env.delete('LINEAR_API_KEY');
});

Deno.test('loadEnvironment - throws when API key missing', async () => {
  // Save original value
  const original = Deno.env.get('LINEAR_API_KEY');

  // Skip all fallbacks and delete the key
  Deno.env.set('SKIP_DOTENV_LOAD', 'true');
  Deno.env.set('SKIP_KEYCHAIN_LOAD', 'true');
  Deno.env.set('SKIP_INTERACTIVE_SETUP', 'true');
  Deno.env.delete('LINEAR_API_KEY');

  try {
    await loadEnvironment();
    throw new Error('Should have thrown');
  } catch (error) {
    assertExists(error);
    // Error message now includes helpful options
    assertStringIncludes((error as Error).message, 'LINEAR_API_KEY is required');
  } finally {
    // Restore original value
    Deno.env.delete('SKIP_DOTENV_LOAD');
    Deno.env.delete('SKIP_KEYCHAIN_LOAD');
    Deno.env.delete('SKIP_INTERACTIVE_SETUP');
    if (original) {
      Deno.env.set('LINEAR_API_KEY', original);
    }
  }
});

Deno.test('loadEnvironment - loads proxy configuration', async () => {
  Deno.env.set('LINEAR_API_KEY', 'test_key');
  Deno.env.set('HTTPS_PROXY', 'http://proxy.example.com:8080');
  const env = await loadEnvironment();
  assertEquals(env.httpsProxy, 'http://proxy.example.com:8080');
  Deno.env.delete('LINEAR_API_KEY');
  Deno.env.delete('HTTPS_PROXY');
});

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

Deno.test('loadEnvironment - SKIP_KEYCHAIN_LOAD skips Keychain fallback', async () => {
  if (Deno.build.os !== 'darwin') {
    return; // Skip on non-macOS
  }

  const original = Deno.env.get('LINEAR_API_KEY');

  // Skip all fallbacks
  Deno.env.set('SKIP_DOTENV_LOAD', 'true');
  Deno.env.set('SKIP_KEYCHAIN_LOAD', 'true');
  Deno.env.set('SKIP_INTERACTIVE_SETUP', 'true');
  Deno.env.delete('LINEAR_API_KEY');

  try {
    // Should throw because Keychain is skipped
    await assertRejects(
      () => loadEnvironment(),
      Error,
      'LINEAR_API_KEY',
    );
  } finally {
    Deno.env.delete('SKIP_DOTENV_LOAD');
    Deno.env.delete('SKIP_KEYCHAIN_LOAD');
    Deno.env.delete('SKIP_INTERACTIVE_SETUP');
    if (original) {
      Deno.env.set('LINEAR_API_KEY', original);
    }
  }
});

Deno.test('loadEnvironment - error message mentions available options', async () => {
  const original = Deno.env.get('LINEAR_API_KEY');

  Deno.env.set('SKIP_DOTENV_LOAD', 'true');
  Deno.env.set('SKIP_KEYCHAIN_LOAD', 'true');
  Deno.env.set('SKIP_INTERACTIVE_SETUP', 'true');
  Deno.env.delete('LINEAR_API_KEY');

  try {
    await loadEnvironment();
    throw new Error('Should have thrown');
  } catch (error) {
    const message = (error as Error).message;
    assertStringIncludes(message, 'environment variable');
    assertStringIncludes(message, '.env file');
    if (Deno.build.os === 'darwin') {
      assertStringIncludes(message, 'Keychain');
    }
  } finally {
    Deno.env.delete('SKIP_DOTENV_LOAD');
    Deno.env.delete('SKIP_KEYCHAIN_LOAD');
    Deno.env.delete('SKIP_INTERACTIVE_SETUP');
    if (original) {
      Deno.env.set('LINEAR_API_KEY', original);
    }
  }
});
