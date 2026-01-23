import { assertEquals, assertStringIncludes } from '@std/assert';
import { getResourceHelp, HELP_TEXT, VERSION } from '../../src/lib/help.ts';

Deno.test('HELP_TEXT - contains basic usage info', () => {
  assertStringIncludes(HELP_TEXT, 'linear-for-ai <resource> <action>');
});

Deno.test('VERSION - is defined', () => {
  assertEquals(typeof VERSION, 'string');
});

Deno.test('getResourceHelp - returns help for issues resource', () => {
  const help = getResourceHelp('issues');
  assertEquals(help !== null, true);
  assertStringIncludes(help!, 'Manage and query issues');
  assertStringIncludes(help!, 'list');
  assertStringIncludes(help!, 'show');
});

Deno.test('getResourceHelp - returns help for projects resource', () => {
  const help = getResourceHelp('projects');
  assertEquals(help !== null, true);
  assertStringIncludes(help!, 'Manage and query projects');
  assertStringIncludes(help!, 'list');
  assertStringIncludes(help!, 'show');
  assertStringIncludes(help!, 'show-updates');
});

Deno.test('getResourceHelp - returns help for initiatives resource', () => {
  const help = getResourceHelp('initiatives');
  assertEquals(help !== null, true);
  assertStringIncludes(help!, 'Manage and query initiatives');
});

Deno.test('getResourceHelp - returns help for notifications resource', () => {
  const help = getResourceHelp('notifications');
  assertEquals(help !== null, true);
  assertStringIncludes(help!, 'Query user notifications');
});

Deno.test('getResourceHelp - returns null for unknown resource', () => {
  const help = getResourceHelp('unknown');
  assertEquals(help, null);
});

Deno.test('getResourceHelp - includes action options', () => {
  const help = getResourceHelp('projects');
  assertEquals(help !== null, true);
  assertStringIncludes(help!, '--filter');
  assertStringIncludes(help!, '--limit');
  assertStringIncludes(help!, '--show-completed');
});

Deno.test('getResourceHelp - includes usage examples', () => {
  const help = getResourceHelp('issues');
  assertEquals(help !== null, true);
  assertStringIncludes(help!, 'linear-for-ai issues list');
  assertStringIncludes(help!, 'linear-for-ai issues show');
});

Deno.test('getResourceHelp - includes global options section', () => {
  const help = getResourceHelp('projects');
  assertEquals(help !== null, true);
  assertStringIncludes(help!, 'GLOBAL OPTIONS:');
  assertStringIncludes(help!, '--format');
  assertStringIncludes(help!, '--debug');
});
