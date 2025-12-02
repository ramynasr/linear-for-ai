/**
 * Command handler for show-updates
 */

import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { CommandContext } from '../../../types/cli.ts';
import type { ProjectWithUpdates, ShowMyUpdatesOptions } from '../types.ts';
import { buildQuery } from './query.ts';
import { formatOutput } from './formatter.ts';

interface ProjectUpdateWithProject {
  id: string;
  body: string;
  createdAt: string;
  url: string;
  user: {
    id: string;
    displayName: string;
  };
  project: {
    id: string;
    name: string;
    url: string;
    description?: string;
    health?: string;
    targetDate?: string;
    state: string;
    lead?: {
      id: string;
      displayName: string;
      email: string;
    };
  };
}

interface ProjectWithIssues {
  id: string;
  name: string;
  url: string;
  description?: string;
  health?: string;
  targetDate?: string;
  state: string;
  lead?: {
    id: string;
    displayName: string;
    email: string;
  };
  issues: {
    nodes: ProjectWithUpdates['issues']['nodes'];
  };
}

interface CombinedResponse {
  projectUpdates: {
    nodes: ProjectUpdateWithProject[];
  };
  projects: {
    nodes: ProjectWithIssues[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export async function showUpdates(
  client: GraphQLClient,
  context: CommandContext<ShowMyUpdatesOptions>,
): Promise<string> {
  // Validate arguments
  if (context.args.length > 1) {
    throw new Error('Expected zero or one argument for show-updates command');
  }

  // Extract idOrUrl for single project mode
  const idOrUrl = context.args.length === 1 ? context.args[0] : undefined;
  const options = context.options;
  // Calculate since date (14 days ago by default)
  const sinceDate = options.since || calculateDefaultSinceDate();

  // Validate date format
  if (!isValidDateFormat(sinceDate)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-15)');
  }

  // Build query parameters
  const limit = options.limit || 10;
  const showAllIssues = options.showAllIssueUpdates || false;

  // Build and execute query
  const query = buildQuery({
    sinceDate,
    limit,
    cursor: options.cursor,
    showAllIssues,
    idOrUrl,
  });

  const response = await client.query<CombinedResponse>({ query });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  // Group project updates by project ID
  const updatesByProject = new Map<string, ProjectUpdateWithProject[]>();
  for (const update of response.data.projectUpdates.nodes) {
    const projectId = update.project.id;
    if (!updatesByProject.has(projectId)) {
      updatesByProject.set(projectId, []);
    }
    updatesByProject.get(projectId)!.push(update);
  }

  // Create a map of projects from the projects query (for issues)
  const projectsMap = new Map<string, ProjectWithIssues>();
  for (const project of response.data.projects.nodes) {
    projectsMap.set(project.id, project);
  }

  // Merge data: get unique project IDs from both queries
  const allProjectIds = new Set([
    ...updatesByProject.keys(),
    ...projectsMap.keys(),
  ]);

  const mergedProjects: ProjectWithUpdates[] = [];

  for (const projectId of allProjectIds) {
    const updates = updatesByProject.get(projectId) || [];
    const projectWithIssues = projectsMap.get(projectId);

    // Get project metadata (prefer from projectWithIssues, fallback to first update's project)
    const projectMeta = projectWithIssues || updates[0]?.project;

    if (!projectMeta) continue;

    // Only include projects with activity
    const hasUpdates = updates.length > 0;
    const hasIssues = projectWithIssues?.issues.nodes.length ?? 0 > 0;

    if (!hasUpdates && !hasIssues) continue;

    mergedProjects.push({
      id: projectId,
      name: projectMeta.name,
      url: projectMeta.url,
      description: projectMeta.description,
      health: projectMeta.health,
      targetDate: projectMeta.targetDate,
      state: projectMeta.state,
      lead: projectMeta.lead,
      projectUpdates: {
        nodes: updates.map((u) => ({
          id: u.id,
          body: u.body,
          createdAt: u.createdAt,
          url: u.url,
          user: u.user,
        })),
      },
      issues: {
        nodes: projectWithIssues?.issues.nodes || [],
      },
    });
  }

  // Sort by most recently updated (based on latest update or issue)
  mergedProjects.sort((a, b) => {
    const aLatest = Math.max(
      ...a.projectUpdates.nodes.map((u) => new Date(u.createdAt).getTime()),
      0,
    );
    const bLatest = Math.max(
      ...b.projectUpdates.nodes.map((u) => new Date(u.createdAt).getTime()),
      0,
    );
    return bLatest - aLatest;
  });

  // Apply limit
  const limitedProjects = mergedProjects.slice(0, limit);

  // Format output
  const format = options.format || 'markdown';
  return formatOutput(limitedProjects, sinceDate, format);
}

function calculateDefaultSinceDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 14);
  return date.toISOString().split('T')[0];
}

function isValidDateFormat(date: string): boolean {
  // Check YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return false;
  }

  // Validate it's a real date
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}
