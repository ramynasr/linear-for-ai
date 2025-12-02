import { assertEquals, assertStringIncludes } from '@std/assert';
import { formatOutput } from '../../src/commands/projects/show-updates/formatter.ts';
import type { ProjectWithUpdates } from '../../src/commands/projects/types.ts';

const mockProject: ProjectWithUpdates = {
  id: '1',
  name: 'Q1 Engineering Goals',
  url: 'https://linear.app/team/project/q1-goals',
  description: 'Engineering goals for Q1',
  health: 'onTrack',
  targetDate: '2025-03-31',
  state: 'started',
  lead: {
    id: '1',
    displayName: 'Alice Johnson',
    email: 'alice@example.com',
  },
  projectUpdates: {
    nodes: [
      {
        id: '1',
        body: 'We made great progress this week',
        createdAt: '2025-11-20T10:00:00Z',
        url: 'https://linear.app/team/project-update/1',
        user: {
          id: '1',
          displayName: 'Alice Johnson',
        },
      },
    ],
  },
  issues: {
    nodes: [
      {
        id: '1',
        identifier: 'ENG-123',
        title: 'Fix authentication bug',
        url: 'https://linear.app/team/ENG-123',
        state: {
          id: '1',
          name: 'Completed',
        },
      },
      {
        id: '2',
        identifier: 'ENG-124',
        title: 'Add password reset',
        url: 'https://linear.app/team/ENG-124',
        state: {
          id: '2',
          name: 'Done',
        },
      },
    ],
  },
};

Deno.test('formatOutput - markdown with complete data', () => {
  const result = formatOutput([mockProject], '2025-11-14', 'markdown');

  // Should include header
  assertStringIncludes(result, '# My Project Updates');
  assertStringIncludes(result, 'Showing updates since 2025-11-14');
  assertStringIncludes(result, '1 project');

  // Should include project name and URL
  assertStringIncludes(result, '## Q1 Engineering Goals');
  assertStringIncludes(result, 'https://linear.app/team/project/q1-goals');

  // Should include overview section
  assertStringIncludes(result, '### Overview');
  assertStringIncludes(result, '* Lead: Alice Johnson (alice@example.com)');
  assertStringIncludes(result, '* Target date: 2025-03-31');
  assertStringIncludes(result, '* Health: onTrack');
  assertStringIncludes(result, '* Status: started');
  assertStringIncludes(result, '* URL: https://linear.app/team/project/q1-goals');

  // Should include description section
  assertStringIncludes(result, '### Description');
  assertStringIncludes(result, 'Engineering goals for Q1');

  // Should include project updates section
  assertStringIncludes(result, '### Project Updates');
  assertStringIncludes(result, 'By Alice Johnson');
  assertStringIncludes(result, 'We made great progress this week');
  // Should NOT include update URL
  assertEquals(result.includes('https://linear.app/team/project-update/1'), false);

  // Should include issues section
  assertStringIncludes(result, '### Recent Completed Issues');
  assertStringIncludes(result, '- ENG-123: Fix authentication bug [Completed]');
  assertStringIncludes(result, '- ENG-124: Add password reset [Done]');
  // Should NOT include issue URLs
  assertEquals(result.includes('https://linear.app/team/ENG-123'), false);

  // Should include project separator
  assertStringIncludes(result, '======================================');
});

Deno.test('formatOutput - JSON format', () => {
  const result = formatOutput([mockProject], '2025-11-14', 'json');
  const parsed = JSON.parse(result);

  assertEquals(parsed.sinceDate, '2025-11-14');
  assertEquals(parsed.projectCount, 1);
  assertEquals(parsed.projects.length, 1);
  assertEquals(parsed.projects[0].name, 'Q1 Engineering Goals');
  assertEquals(parsed.projects[0].projectUpdates.nodes.length, 1);
  assertEquals(parsed.projects[0].issues.nodes.length, 2);
});

Deno.test('formatOutput - handles missing description', () => {
  const projectWithoutDesc = {
    ...mockProject,
    description: undefined,
  };

  const result = formatOutput([projectWithoutDesc], '2025-11-14', 'markdown');
  assertStringIncludes(result, '(No description)');
});

Deno.test('formatOutput - handles missing lead', () => {
  const projectWithoutLead = {
    ...mockProject,
    lead: undefined,
  };

  const result = formatOutput([projectWithoutLead], '2025-11-14', 'markdown');
  assertStringIncludes(result, '* Lead: Unassigned');
});

Deno.test('formatOutput - handles missing target date', () => {
  const projectWithoutDate = {
    ...mockProject,
    targetDate: undefined,
  };

  const result = formatOutput([projectWithoutDate], '2025-11-14', 'markdown');
  assertStringIncludes(result, '* Target date: Not set');
});

Deno.test('formatOutput - handles missing health', () => {
  const projectWithoutHealth = {
    ...mockProject,
    health: undefined,
  };

  const result = formatOutput([projectWithoutHealth], '2025-11-14', 'markdown');
  assertStringIncludes(result, '* Health: Unknown');
});

Deno.test('formatOutput - omits project updates section when empty', () => {
  const projectWithoutUpdates = {
    ...mockProject,
    projectUpdates: { nodes: [] },
  };

  const result = formatOutput(
    [projectWithoutUpdates],
    '2025-11-14',
    'markdown',
  );

  // Should NOT include project updates section
  assertEquals(result.includes('### Project Updates'), false);
});

Deno.test('formatOutput - omits issues section when empty', () => {
  const projectWithoutIssues = {
    ...mockProject,
    issues: { nodes: [] },
  };

  const result = formatOutput([projectWithoutIssues], '2025-11-14', 'markdown');

  // Should NOT include issues section
  assertEquals(result.includes('### Recent Completed Issues'), false);
});

Deno.test('formatOutput - handles empty projects array', () => {
  const result = formatOutput([], '2025-11-14', 'markdown');

  assertStringIncludes(
    result,
    'No projects found with activity since 2025-11-14',
  );
});

Deno.test('formatOutput - formats multiple projects', () => {
  const project2: ProjectWithUpdates = {
    ...mockProject,
    id: '2',
    name: 'Q2 Engineering Goals',
    url: 'https://linear.app/team/project/q2-goals',
  };

  const result = formatOutput(
    [mockProject, project2],
    '2025-11-14',
    'markdown',
  );

  assertStringIncludes(result, '2 projects');
  assertStringIncludes(result, '## Q1 Engineering Goals');
  assertStringIncludes(result, '## Q2 Engineering Goals');
});

Deno.test('formatOutput - sanitizes markdown headers in description', () => {
  const projectWithHeaders = {
    ...mockProject,
    description: '# Main Goal\n\nSome text\n\n## Sub Goal\n\nMore text',
  };

  const result = formatOutput([projectWithHeaders], '2025-11-14', 'markdown');

  // Should convert headers to bold
  assertStringIncludes(result, '**Main Goal**');
  assertStringIncludes(result, '**Sub Goal**');
  // Should NOT have actual headers
  assertEquals(result.includes('# Main Goal'), false);
  assertEquals(result.includes('## Sub Goal'), false);
});

Deno.test('formatOutput - sanitizes markdown headers in project updates', () => {
  const projectWithHeadersInUpdate = {
    ...mockProject,
    projectUpdates: {
      nodes: [{
        id: '1',
        body: '# Weekly Update\n\nWe made progress\n\n## Key Points\n\nPoint 1',
        createdAt: '2025-11-20T10:00:00Z',
        url: 'https://linear.app/team/project-update/1',
        user: {
          id: '1',
          displayName: 'Alice Johnson',
        },
      }],
    },
  };

  const result = formatOutput(
    [projectWithHeadersInUpdate],
    '2025-11-14',
    'markdown',
  );

  // Should convert headers to bold in update body
  assertStringIncludes(result, '**Weekly Update**');
  assertStringIncludes(result, '**Key Points**');
  // Should NOT have actual headers in update
  const updateSection = result.split('### Project Updates')[1];
  assertEquals(updateSection.includes('# Weekly Update'), false);
  assertEquals(updateSection.includes('## Key Points'), false);
});

Deno.test('formatOutput - shows issue count when more than 20', () => {
  const manyIssues = Array.from({ length: 21 }, (_, i) => ({
    id: `${i}`,
    identifier: `ENG-${i}`,
    title: `Issue ${i}`,
    url: `https://linear.app/team/ENG-${i}`,
    state: { id: '1', name: 'Done' },
  }));

  const projectWithManyIssues = {
    ...mockProject,
    issues: { nodes: manyIssues },
  };

  const result = formatOutput(
    [projectWithManyIssues],
    '2025-11-14',
    'markdown',
  );

  // Only 20 should be shown
  assertStringIncludes(result, 'Showing 20 of 21');
});
