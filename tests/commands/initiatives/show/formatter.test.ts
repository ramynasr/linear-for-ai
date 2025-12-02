import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { formatInitiativeDetail } from '../../../../src/commands/initiatives/show/formatter.ts';
import type { LinearInitiative } from '../../../../src/commands/initiatives/types.ts';

Deno.test('formatInitiativeDetail - formats initiative detail as markdown', () => {
  const mockInitiative: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform Initiative',
    status: 'Active',
    slugId: 'INI-123',
    url: 'https://linear.app/test/initiative/INI-123',
    description: 'Platform improvements for Q4',
    health: 'onTrack',
    createdAt: '2025-10-01T10:00:00Z',
    owner: {
      id: 'user-1',
      displayName: 'John Doe',
      email: 'john@example.com',
    },
    creator: {
      id: 'user-2',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
    },
  };

  const result = formatInitiativeDetail(mockInitiative, 'markdown');

  assertStringIncludes(result, '# Q4 Platform Initiative (INI-123)');
  assertStringIncludes(result, '**Status:** Active');
  assertStringIncludes(result, '**Health:** onTrack');
  assertStringIncludes(result, '**Owner:** John Doe');
  assertStringIncludes(result, '## Description');
  assertStringIncludes(result, 'Platform improvements for Q4');
});

Deno.test('formatInitiativeDetail - formats initiative detail as JSON', () => {
  const mockInitiative: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform Initiative',
    status: 'Active',
    slugId: 'INI-123',
  };

  const result = formatInitiativeDetail(mockInitiative, 'json');

  const parsed = JSON.parse(result);
  assertEquals(parsed.name, 'Q4 Platform Initiative');
  assertEquals(parsed.status, 'Active');
  assertEquals(parsed.slugId, 'INI-123');
});

Deno.test('formatInitiativeDetail - includes projects section when present', () => {
  const initiativeWithProjects: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform',
    status: 'Active',
    slugId: 'INI-123',
    projects: {
      nodes: [
        {
          id: 'proj-1',
          name: 'Backend API',
          status: 'In Progress',
          url: 'https://linear.app/test/project/PRJ-456',
        },
      ],
    },
  };

  const result = formatInitiativeDetail(initiativeWithProjects, 'markdown');

  assertStringIncludes(result, '## Projects (updated in last 2 weeks)');
  assertStringIncludes(result, 'Backend API');
  assertStringIncludes(result, 'In Progress');
  assertStringIncludes(result, 'https://linear.app/test/project/PRJ-456');
});

Deno.test('formatInitiativeDetail - includes sub-initiatives section when present', () => {
  const initiativeWithSubs: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform',
    status: 'Active',
    slugId: 'INI-123',
    subInitiatives: {
      nodes: [
        {
          id: 'sub-1',
          name: 'Authentication',
          status: 'Active',
          health: 'onTrack',
          slugId: 'INI-125',
        },
      ],
    },
  };

  const result = formatInitiativeDetail(initiativeWithSubs, 'markdown');

  assertStringIncludes(result, '## Sub-Initiatives');
  assertStringIncludes(result, 'Authentication');
  assertStringIncludes(result, 'INI-125');
  assertStringIncludes(result, 'onTrack');
});

Deno.test('formatInitiativeDetail - includes last update when present', () => {
  const initiativeWithUpdate: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform',
    status: 'Active',
    slugId: 'INI-123',
    lastUpdate: {
      id: 'update-1',
      body: 'Everything is on track',
      createdAt: '2025-11-25T14:00:00Z',
      user: { displayName: 'John Doe' },
    },
  };

  const result = formatInitiativeDetail(initiativeWithUpdate, 'markdown');

  assertStringIncludes(result, '## Last Update');
  assertStringIncludes(result, 'Posted by John Doe');
  assertStringIncludes(result, 'Everything is on track');
});

Deno.test('formatInitiativeDetail - handles initiative without optional fields', () => {
  const minimalInitiative: LinearInitiative = {
    id: 'init-1',
    name: 'Minimal Initiative',
    status: 'Active',
    slugId: 'INI-999',
  };

  const result = formatInitiativeDetail(minimalInitiative, 'markdown');

  assertStringIncludes(result, '# Minimal Initiative (INI-999)');
  assertStringIncludes(result, '**ID:** init-1');
  assertStringIncludes(result, '**Status:** Active');
  // Should not include sections for missing data
  assertEquals(result.includes('## Projects'), false);
  assertEquals(result.includes('## Sub-Initiatives'), false);
  assertEquals(result.includes('## Last Update'), false);
});

Deno.test('formatInitiativeDetail - includes content section when present', () => {
  const initiativeWithContent: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform',
    status: 'Active',
    slugId: 'INI-123',
    content: 'Detailed content about the initiative',
  };

  const result = formatInitiativeDetail(initiativeWithContent, 'markdown');

  assertStringIncludes(result, '## Content');
  assertStringIncludes(result, 'Detailed content about the initiative');
});

Deno.test('formatInitiativeDetail - includes URL when present', () => {
  const initiativeWithUrl: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform',
    status: 'Active',
    slugId: 'INI-123',
    url: 'https://linear.app/myteam/initiative/INI-123',
  };

  const result = formatInitiativeDetail(initiativeWithUrl, 'markdown');

  assertStringIncludes(result, '**URL:** https://linear.app/myteam/initiative/INI-123');
});

Deno.test('formatInitiativeDetail - handles multiple projects', () => {
  const initiativeWithMultipleProjects: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform',
    status: 'Active',
    slugId: 'INI-123',
    projects: {
      nodes: [
        {
          id: 'proj-1',
          name: 'Backend API',
          status: 'In Progress',
          url: 'https://linear.app/test/project/PRJ-1',
        },
        {
          id: 'proj-2',
          name: 'Frontend UI',
          status: 'Planned',
          url: 'https://linear.app/test/project/PRJ-2',
        },
        {
          id: 'proj-3',
          name: 'Database Migration',
          status: 'Completed',
          url: 'https://linear.app/test/project/PRJ-3',
        },
      ],
    },
  };

  const result = formatInitiativeDetail(initiativeWithMultipleProjects, 'markdown');

  assertStringIncludes(result, 'Backend API');
  assertStringIncludes(result, 'Frontend UI');
  assertStringIncludes(result, 'Database Migration');
  assertStringIncludes(result, 'In Progress');
  assertStringIncludes(result, 'Planned');
  assertStringIncludes(result, 'Completed');
});

Deno.test('formatInitiativeDetail - handles sub-initiative without health', () => {
  const initiativeWithSubsNoHealth: LinearInitiative = {
    id: 'init-1',
    name: 'Q4 Platform',
    status: 'Active',
    slugId: 'INI-123',
    subInitiatives: {
      nodes: [
        {
          id: 'sub-1',
          name: 'Authentication',
          status: 'Active',
          slugId: 'INI-125',
        },
      ],
    },
  };

  const result = formatInitiativeDetail(initiativeWithSubsNoHealth, 'markdown');

  assertStringIncludes(result, '**INI-125**: Authentication (Active)');
  // Should not include a comma for missing health
  assertEquals(result.includes('(Active,)'), false);
});
