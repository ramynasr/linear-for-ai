import { assertEquals } from '@std/assert';

Deno.test('CLI - shows help with --help flag', async () => {
  const command = new Deno.Command('deno', {
    args: ['run', '--allow-net', '--allow-env', '--allow-read', 'src/cli.ts', '--help'],
  });

  const { code, stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  assertEquals(output.includes('linear-for-ai'), true);
  assertEquals(output.includes('USAGE:'), true);
});

Deno.test('CLI - shows version with --version flag', async () => {
  const command = new Deno.Command('deno', {
    args: ['run', '--allow-net', '--allow-env', '--allow-read', 'src/cli.ts', '--version'],
  });

  const { code, stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  assertEquals(output.includes('linear-for-ai v'), true);
});

Deno.test('CLI - errors without API key', async () => {
  const command = new Deno.Command('deno', {
    args: ['run', '--allow-net', '--allow-env', '--allow-read', 'src/cli.ts', 'issues', 'list'],
    env: { LINEAR_API_KEY: '' },
    clearEnv: true,
  });

  const { code, stderr } = await command.output();
  const output = new TextDecoder().decode(stderr);

  assertEquals(code, 1);
  assertEquals(output.includes('LINEAR_API_KEY'), true);
});
