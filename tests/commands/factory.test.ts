import { assertEquals } from '@std/assert';
import { CommandFactory } from '../../src/commands/factory.ts';

Deno.test('CommandFactory.get - returns handler for valid command', () => {
  const handler = CommandFactory.get('issues', 'list');
  assertEquals(typeof handler, 'function');
});

Deno.test('CommandFactory.get - returns handler for issues show', () => {
  const handler = CommandFactory.get('issues', 'show');
  assertEquals(typeof handler, 'function');
});

Deno.test('CommandFactory.get - returns handler for projects list', () => {
  const handler = CommandFactory.get('projects', 'list');
  assertEquals(typeof handler, 'function');
});

Deno.test('CommandFactory.get - returns handler for projects show', () => {
  const handler = CommandFactory.get('projects', 'show');
  assertEquals(typeof handler, 'function');
});

Deno.test('CommandFactory.get - returns handler for projects show-my-updates', () => {
  const handler = CommandFactory.get('projects', 'show-my-updates');
  assertEquals(typeof handler, 'function');
});

Deno.test('CommandFactory.get - returns handler for notifications list', () => {
  const handler = CommandFactory.get('notifications', 'list');
  assertEquals(typeof handler, 'function');
});

Deno.test('CommandFactory.get - returns undefined for unknown resource', () => {
  const handler = CommandFactory.get('unknown', 'list');
  assertEquals(handler, undefined);
});

Deno.test('CommandFactory.get - returns undefined for unknown action', () => {
  const handler = CommandFactory.get('issues', 'unknown');
  assertEquals(handler, undefined);
});
