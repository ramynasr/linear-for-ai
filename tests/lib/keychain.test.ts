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
