import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  extractInitiativeIdentifier,
  extractIssueIdentifier,
  extractProjectIdentifier,
} from '../../../src/lib/utils/url.ts';

Deno.test('extractInitiativeIdentifier - extracts slugId from Linear URL', () => {
  const url = 'https://linear.app/myteam/initiative/q4-platform-initiative-abc123def456';
  const result = extractInitiativeIdentifier(url);
  assertEquals(result, 'abc123def456');
});

Deno.test('extractInitiativeIdentifier - returns slugId as-is when no URL', () => {
  const slugId = 'abc123def456';
  const result = extractInitiativeIdentifier(slugId);
  assertEquals(result, 'abc123def456');
});

Deno.test('extractInitiativeIdentifier - returns UUID as-is when provided', () => {
  const uuid = 'abc-123-def-456';
  const result = extractInitiativeIdentifier(uuid);
  assertEquals(result, 'abc-123-def-456');
});

Deno.test('extractInitiativeIdentifier - handles URLs with query parameters', () => {
  const url = 'https://linear.app/myteam/initiative/my-initiative-789abc?view=details';
  const result = extractInitiativeIdentifier(url);
  assertEquals(result, '789abc');
});

Deno.test('extractInitiativeIdentifier - handles URLs with hash fragments', () => {
  const url = 'https://linear.app/myteam/initiative/test-initiative-999def#updates';
  const result = extractInitiativeIdentifier(url);
  assertEquals(result, '999def');
});

Deno.test('extractInitiativeIdentifier - handles URLs with both query and hash', () => {
  const url = 'https://linear.app/workspace/initiative/big-initiative-001aaa?tab=overview#section';
  const result = extractInitiativeIdentifier(url);
  assertEquals(result, '001aaa');
});

Deno.test('extractInitiativeIdentifier - handles different team names', () => {
  const url = 'https://linear.app/my-cool-team-123/initiative/another-initiative-555bbb';
  const result = extractInitiativeIdentifier(url);
  assertEquals(result, '555bbb');
});

Deno.test('extractIssueIdentifier - extracts issue key from Linear URL', () => {
  const url = 'https://linear.app/myteam/issue/ENG-123';
  const result = extractIssueIdentifier(url);
  assertEquals(result, 'ENG-123');
});

Deno.test('extractIssueIdentifier - returns issue key as-is when no URL', () => {
  const issueKey = 'ENG-456';
  const result = extractIssueIdentifier(issueKey);
  assertEquals(result, 'ENG-456');
});

Deno.test('extractIssueIdentifier - handles URLs with query parameters', () => {
  const url = 'https://linear.app/team/issue/BUG-789?view=full';
  const result = extractIssueIdentifier(url);
  assertEquals(result, 'BUG-789');
});

Deno.test('extractProjectIdentifier - extracts project key from Linear URL', () => {
  const url = 'https://linear.app/myteam/project/PRJ-123';
  const result = extractProjectIdentifier(url);
  assertEquals(result, 'PRJ-123');
});

Deno.test('extractProjectIdentifier - returns project key as-is when no URL', () => {
  const projectKey = 'PRJ-456';
  const result = extractProjectIdentifier(projectKey);
  assertEquals(result, 'PRJ-456');
});

Deno.test('extractProjectIdentifier - handles URLs with hash fragments', () => {
  const url = 'https://linear.app/team/project/PROJ-999#details';
  const result = extractProjectIdentifier(url);
  assertEquals(result, 'PROJ-999');
});
