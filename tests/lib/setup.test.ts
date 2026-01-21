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
