import { assertEquals, assertStringIncludes } from '@std/assert';

Deno.test('show-updates integration - displays help text', async () => {
  const process = new Deno.Command('deno', {
    args: [
      'run',
      '--allow-net',
      '--allow-env',
      '--allow-read',
      'src/cli.ts',
      'projects',
      'show-updates',
      '--help',
    ],
    stdout: 'piped',
    stderr: 'piped',
  });

  const { code, stdout } = await process.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  // Should show usage with optional argument
  assertStringIncludes(output, 'show-updates');
  assertStringIncludes(output, 'id|url');
});
