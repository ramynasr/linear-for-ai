import { assertEquals } from '@std/assert';
import { parseArgs } from '../../src/lib/cli-parser.ts';

Deno.test('parseArgs - parses issues list command', () => {
  const result = parseArgs(['issues', 'list', '--limit', '25']);
  assertEquals(result.resource, 'issues');
  assertEquals(result.action, 'list');
  assertEquals(result.options.limit, 25);
});

Deno.test('parseArgs - parses issues show command', () => {
  const result = parseArgs(['issues', 'show', 'ENG-123']);
  assertEquals(result.resource, 'issues');
  assertEquals(result.action, 'show');
  assertEquals(result.args[0], 'ENG-123');
});

Deno.test('parseArgs - parses global options', () => {
  const result = parseArgs(['--format', 'json', '--debug', 'issues', 'list']);
  assertEquals(result.options.format, 'json');
  assertEquals(result.options.debug, true);
});

Deno.test('parseArgs - handles help flag', () => {
  const result = parseArgs(['--help']);
  assertEquals(result.showHelp, true);
});

Deno.test('parseArgs - handles resource-level help', () => {
  const result = parseArgs(['projects', '--help']);
  assertEquals(result.resource, 'projects');
  assertEquals(result.showResourceHelp, true);
  assertEquals(result.showHelp, false);
});

Deno.test('parseArgs - handles resource-level help with -h alias', () => {
  const result = parseArgs(['issues', '-h']);
  assertEquals(result.resource, 'issues');
  assertEquals(result.showResourceHelp, true);
  assertEquals(result.showHelp, false);
});

Deno.test('parseArgs - sets showResourceHelp when action is provided with --help', () => {
  const result = parseArgs(['issues', 'list', '--help']);
  assertEquals(result.resource, 'issues');
  assertEquals(result.action, 'list');
  assertEquals(result.showResourceHelp, true);
});
