import type { LinearInitiative } from '../types.ts';

export function formatInitiativeDetail(
  initiative: LinearInitiative,
  format: 'markdown' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify(initiative, null, 2);
  }

  // Markdown format
  let output = `# ${initiative.name}`;

  if (initiative.slugId) {
    output += ` (${initiative.slugId})`;
  }

  output += '\n\n';

  // Basic info
  output += `**ID:** ${initiative.id}\n`;
  output += `**Status:** ${initiative.status}\n`;

  if (initiative.health) {
    output += `**Health:** ${initiative.health}\n`;
  }

  if (initiative.url) {
    output += `**URL:** ${initiative.url}\n`;
  }

  output += '\n';

  // People
  if (initiative.owner) {
    output += `**Owner:** ${initiative.owner.name} (${initiative.owner.email})\n`;
  }

  if (initiative.creator && initiative.createdAt) {
    output += `**Created:** ${initiative.createdAt} by ${initiative.creator.name} (${initiative.creator.email})\n`;
  }

  output += '\n';

  // Description
  if (initiative.description) {
    output += `## Description\n\n${initiative.description}\n\n`;
  }

  // Content
  if (initiative.content) {
    output += `## Content\n\n${initiative.content}\n\n`;
  }

  // Last update
  if (initiative.lastUpdate) {
    const update = initiative.lastUpdate;
    output += `## Last Update\n\n`;
    output += `Posted by ${update.user.name} on ${update.createdAt}:\n\n`;
    output += `${update.body}\n\n`;
  }

  // Projects (updated in last 2 weeks)
  if (initiative.projects && initiative.projects.nodes.length > 0) {
    output += `## Projects (updated in last 2 weeks)\n\n`;
    for (const project of initiative.projects.nodes) {
      output += `- **${project.id}**: ${project.name} (${project.status})`;
      if (project.url) {
        output += ` - ${project.url}`;
      }
      output += '\n';
    }
    output += '\n';
  }

  // Sub-initiatives
  if (initiative.subInitiatives && initiative.subInitiatives.nodes.length > 0) {
    output += `## Sub-Initiatives\n\n`;
    for (const sub of initiative.subInitiatives.nodes) {
      output += `- **${sub.slugId}**: ${sub.name} (${sub.status}`;
      if (sub.health) {
        output += `, ${sub.health}`;
      }
      output += ')\n';
    }
    output += '\n';
  }

  return output.trim();
}
