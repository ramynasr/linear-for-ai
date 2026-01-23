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

Deno.test('CommandFactory.get - returns handler for projects show-updates', () => {
  const handler = CommandFactory.get('projects', 'show-updates');
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

Deno.test('CommandFactory.getResourceMetadata - returns metadata for valid resource', () => {
  const metadata = CommandFactory.getResourceMetadata('issues');
  assertEquals(metadata?.description, 'Manage and query issues');
  assertEquals(Object.keys(metadata?.actions || {}), ['list', 'show']);
});

Deno.test('CommandFactory.getResourceMetadata - returns metadata for projects', () => {
  const metadata = CommandFactory.getResourceMetadata('projects');
  assertEquals(metadata?.description, 'Manage and query projects');
  assertEquals(Object.keys(metadata?.actions || {}), ['list', 'show', 'show-updates']);
});

Deno.test('CommandFactory.getResourceMetadata - returns undefined for unknown resource', () => {
  const metadata = CommandFactory.getResourceMetadata('unknown');
  assertEquals(metadata, undefined);
});

Deno.test('CommandFactory.getAvailableResources - returns all resources', () => {
  const resources = CommandFactory.getAvailableResources();
  assertEquals(resources.includes('issues'), true);
  assertEquals(resources.includes('projects'), true);
  assertEquals(resources.includes('initiatives'), true);
  assertEquals(resources.includes('notifications'), true);
});

Deno.test('CommandFactory.hasResource - returns true for valid resource', () => {
  assertEquals(CommandFactory.hasResource('issues'), true);
  assertEquals(CommandFactory.hasResource('projects'), true);
});

Deno.test('CommandFactory.hasResource - returns false for unknown resource', () => {
  assertEquals(CommandFactory.hasResource('unknown'), false);
});
