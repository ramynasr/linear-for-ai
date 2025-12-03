/**
 * Formatter for show-my-updates command
 */

import type { ProjectWithUpdates } from '../types.ts';

/**
 * Sanitize markdown headers to prevent structure issues
 * Converts # Header, ## Header, etc. to **Header**
 */
function sanitizeMarkdownHeaders(text: string): string {
  // Replace markdown headers (1-6 levels) with bold text
  return text.replace(/^(#{1,6})\s+(.+)$/gm, '**$2**');
}

export function formatOutput(
  projects: ProjectWithUpdates[],
  sinceDate: string,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify(
      {
        sinceDate,
        projectCount: projects.length,
        projects,
      },
      null,
      2,
    );
  }

  return formatMarkdown(projects, sinceDate);
}

function formatMarkdown(
  projects: ProjectWithUpdates[],
  sinceDate: string,
): string {
  if (projects.length === 0) {
    return `No projects found with activity since ${sinceDate}.`;
  }

  const projectsPlural = projects.length === 1 ? 'project' : 'projects';
  let output =
    `# My Project Updates\n\nShowing updates since ${sinceDate} across ${projects.length} ${projectsPlural}\n\n`;

  for (const project of projects) {
    output += formatProject(project);
  }

  return output;
}

function formatProject(project: ProjectWithUpdates): string {
  let output = `## ${project.name}\n\n`;

  // Overview section
  output += `### Overview\n\n`;
  const lead = project.lead ? `${project.lead.displayName} (${project.lead.email})` : 'Unassigned';
  const targetDate = project.targetDate || 'Not set';
  const health = project.health || 'Unknown';
  const state = project.state;

  output += `* Lead: ${lead}\n`;
  output += `* Target date: ${targetDate}\n`;
  output += `* Health: ${health}\n`;
  output += `* Status: ${state}\n`;
  output += `* URL: ${project.url}\n\n`;

  // Description section
  output += `### Description\n\n`;
  const description = project.description || '(No description)';
  output += `${sanitizeMarkdownHeaders(description)}\n`;

  // Format project updates
  if (project.projectUpdates.nodes.length > 0) {
    output += `\n### Project Updates\n\n`;
    for (let i = 0; i < project.projectUpdates.nodes.length; i++) {
      const update = project.projectUpdates.nodes[i];
      output += formatProjectUpdate(update);
      if (i < project.projectUpdates.nodes.length - 1) {
        output += '\n---------------------------------------\n\n';
      }
    }
  }

  // Format issues
  if (project.issues.nodes.length > 0) {
    const totalIssues = project.issues.nodes.length;
    const displayCount = Math.min(totalIssues, 20);
    const issuesToShow = project.issues.nodes.slice(0, 20);

    output += '\n### Recent Completed Issues';
    if (totalIssues > 20) {
      output += ` (Showing ${displayCount} of ${totalIssues})`;
    }
    output += '\n\n';

    for (const issue of issuesToShow) {
      output += `- ${issue.identifier}: ${issue.title} [${issue.state.name}]\n`;
    }
    output += '\n';
  }

  output += '\n======================================\n';

  return output;
}

function formatProjectUpdate(
  update: ProjectWithUpdates['projectUpdates']['nodes'][0],
): string {
  const date = new Date(update.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let output = `[${date}] By ${update.user.displayName}\n\n`;
  output += `${sanitizeMarkdownHeaders(update.body)}\n`;

  return output;
}
