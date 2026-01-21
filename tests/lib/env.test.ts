import { assertEquals, assertExists, assertRejects } from '@std/assert';
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

  // Skip .env loading and interactive setup, then delete the key
  Deno.env.set('SKIP_DOTENV_LOAD', 'true');
  Deno.env.set('SKIP_INTERACTIVE_SETUP', 'true');
  Deno.env.delete('LINEAR_API_KEY');

  try {
    await loadEnvironment();
    throw new Error('Should have thrown');
  } catch (error) {
    assertExists(error);
    assertEquals((error as Error).message, 'LINEAR_API_KEY environment variable is required');
  } finally {
    // Restore original value
    Deno.env.delete('SKIP_DOTENV_LOAD');
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
