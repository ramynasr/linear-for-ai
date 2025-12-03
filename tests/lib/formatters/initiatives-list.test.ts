import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { formatInitiativesList } from '../../../src/lib/formatters/initiatives.ts';
import type { LinearConnection } from '../../../src/types/linear.ts';
import type { LinearInitiative } from '../../../src/commands/initiatives/types.ts';

Deno.test('formatInitiativesList - formats initiatives as markdown table', () => {
  const mockInitiatives: LinearConnection<LinearInitiative> = {
    nodes: [
      {
        id: 'init-1',
        name: 'Q4 Platform',
        status: 'Active',
        slugId: 'INI-123',
        url: 'https://linear.app/test/initiative/INI-123',
      },
      {
        id: 'init-2',
        name: 'API Redesign',
        status: 'Planned',
        slugId: 'INI-124',
        url: 'https://linear.app/test/initiative/INI-124',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const result = formatInitiativesList(mockInitiatives, ['id', 'name', 'status', 'slugId', 'url']);

  assertStringIncludes(result, '## Initiatives');
  assertStringIncludes(result, 'Q4 Platform');
  assertStringIncludes(result, 'INI-123');
  assertStringIncludes(result, 'Active');
  assertStringIncludes(result, 'API Redesign');
  assertStringIncludes(result, 'INI-124');
  assertStringIncludes(result, 'Planned');
});

Deno.test('formatInitiativesList - shows pagination info when hasNextPage is true', () => {
  const paginatedData: LinearConnection<LinearInitiative> = {
    nodes: [
      {
        id: 'init-1',
        name: 'Q4 Platform',
        status: 'Active',
        slugId: 'INI-123',
      },
    ],
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
      endCursor: 'cursor123',
    },
  };

  const result = formatInitiativesList(paginatedData, ['id', 'name']);

  assertStringIncludes(result, '--cursor=cursor123');
  assertStringIncludes(result, 'next page');
});

Deno.test('formatInitiativesList - handles empty results', () => {
  const emptyData: LinearConnection<LinearInitiative> = {
    nodes: [],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };

  const result = formatInitiativesList(emptyData, ['id', 'name']);

  assertEquals(result, '## Initiatives\n\nNo initiatives found.');
});

Deno.test('formatInitiativesList - shows count of results', () => {
  const mockInitiatives: LinearConnection<LinearInitiative> = {
    nodes: [
      {
        id: 'init-1',
        name: 'Initiative One',
        status: 'Active',
        slugId: 'INI-1',
      },
      {
        id: 'init-2',
        name: 'Initiative Two',
        status: 'Active',
        slugId: 'INI-2',
      },
      {
        id: 'init-3',
        name: 'Initiative Three',
        status: 'Completed',
        slugId: 'INI-3',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const result = formatInitiativesList(mockInitiatives, ['id', 'name']);

  assertStringIncludes(result, '## Initiatives (3 results)');
});

Deno.test('formatInitiativesList - singular result count', () => {
  const singleResult: LinearConnection<LinearInitiative> = {
    nodes: [
      {
        id: 'init-1',
        name: 'Single Initiative',
        status: 'Active',
        slugId: 'INI-1',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const result = formatInitiativesList(singleResult, ['id', 'name']);

  assertStringIncludes(result, '## Initiatives (1 result)');
});

Deno.test('formatInitiativesList - handles nested fields with dot notation', () => {
  const mockInitiatives: LinearConnection<LinearInitiative> = {
    nodes: [
      {
        id: 'init-1',
        name: 'Q4 Platform',
        status: 'Active',
        slugId: 'INI-123',
        owner: {
          id: 'user-1',
          displayName: 'John Doe',
          email: 'john@example.com',
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const result = formatInitiativesList(mockInitiatives, ['id', 'name', 'owner.displayName']);

  assertStringIncludes(result, 'John Doe');
});

Deno.test('formatInitiativesList - auto-detects fields when not provided', () => {
  const mockInitiatives: LinearConnection<LinearInitiative> = {
    nodes: [
      {
        id: 'init-1',
        name: 'Q4 Platform',
        status: 'Active',
        slugId: 'INI-123',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const result = formatInitiativesList(mockInitiatives);

  assertStringIncludes(result, 'init-1');
  assertStringIncludes(result, 'Q4 Platform');
  assertStringIncludes(result, 'Active');
  assertStringIncludes(result, 'INI-123');
});

Deno.test('formatInitiativesList - handles health field', () => {
  const mockInitiatives: LinearConnection<LinearInitiative> = {
    nodes: [
      {
        id: 'init-1',
        name: 'Q4 Platform',
        status: 'Active',
        slugId: 'INI-123',
        health: 'onTrack',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const result = formatInitiativesList(mockInitiatives, ['id', 'name', 'health']);

  assertStringIncludes(result, 'onTrack');
});
