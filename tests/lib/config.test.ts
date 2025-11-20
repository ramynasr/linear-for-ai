import { assertEquals } from '@std/assert';
import { loadConfig, getConfigPath } from '../../src/lib/config.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';
import * as path from '@std/path';

Deno.test('getConfigPath - returns default path', () => {
  const configPath = getConfigPath();
  const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE');
  const expected = path.join(homeDir!, '.config', 'linear-for-ai', 'config.json');
  assertEquals(configPath, expected);
});

Deno.test('getConfigPath - returns custom path from environment', () => {
  Deno.env.set('LINEAR_CONFIG', '/custom/path/config.json');
  const configPath = getConfigPath();
  assertEquals(configPath, '/custom/path/config.json');
  Deno.env.delete('LINEAR_CONFIG');
});

Deno.test('loadConfig - returns default config when file not found', async () => {
  const config = await loadConfig('/nonexistent/config.json');
  assertEquals(config, DEFAULT_CONFIG);
});

Deno.test('loadConfig - merges user config with defaults', async () => {
  const testConfigPath = await Deno.makeTempFile({ suffix: '.json' });
  await Deno.writeTextFile(testConfigPath, JSON.stringify({
    allowWrites: true,
    defaults: { limit: 100 },
  }));

  const config = await loadConfig(testConfigPath);
  assertEquals(config.allowWrites, true);
  assertEquals(config.defaults.limit, 100);
  assertEquals(config.defaults.format, 'markdown'); // From defaults

  await Deno.remove(testConfigPath);
});
