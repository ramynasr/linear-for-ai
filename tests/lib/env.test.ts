import { assertEquals, assertExists } from '@std/assert';
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

  // Skip .env loading and delete the key
  Deno.env.set('SKIP_DOTENV_LOAD', 'true');
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
