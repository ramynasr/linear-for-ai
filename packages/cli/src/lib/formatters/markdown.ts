import { Issue, Project, Cycle, Team, ListResult } from './types.js';

export class MarkdownFormatter {
  static formatIssueList(result: ListResult<Issue>): string {
    const lines: string[] = [];

    lines.push(`## Issues (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No issues found.');
      return lines.join('\n');
    }

    // Table header
    lines.push('| ID | Title | URL |');
    lines.push('|----|-------|-----|');

    // Table rows
    result.items.forEach(issue => {
      lines.push(`| ${issue.id} | ${issue.title} | ${issue.url} |`);
    });

    // Pagination info
    if (result.pagination) {
      lines.push('');
      if (result.pagination.hasNextPage) {
        lines.push(`Showing ${result.items.length} results. Use --cursor=${result.pagination.endCursor} for next page.`);
      } else {
        lines.push(`Showing all ${result.items.length} results.`);
      }
    }

    return lines.join('\n');
  }

  static formatIssueDetail(issue: Issue): string {
    const lines: string[] = [];

    lines.push(`## ${issue.id}: ${issue.title}`);
    lines.push('');
    lines.push(`Status:     ${issue.status}`);
    if (issue.assignee) lines.push(`Assignee:   ${issue.assignee}`);
    if (issue.priority) lines.push(`Priority:   ${issue.priority}`);
    if (issue.project) lines.push(`Project:    ${issue.project}`);
    if (issue.cycle) lines.push(`Cycle:      ${issue.cycle}`);
    lines.push(`Created:    ${issue.createdAt}`);
    if (issue.updatedAt) lines.push(`Updated:    ${issue.updatedAt}`);
    lines.push(`URL:        ${issue.url}`);

    if (issue.description) {
      lines.push('');
      lines.push('### Description');
      lines.push('');
      lines.push(issue.description);
    }

    return lines.join('\n');
  }

  static formatProjectList(result: ListResult<Project>): string {
    const lines: string[] = [];

    lines.push(`## Projects (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No projects found.');
      return lines.join('\n');
    }

    lines.push('| ID | Title | URL |');
    lines.push('|----|-------|-----|');

    result.items.forEach(project => {
      lines.push(`| ${project.id} | ${project.name} | ${project.url} |`);
    });

    return lines.join('\n');
  }

  static formatProjectDetail(project: Project): string {
    const lines: string[] = [];

    lines.push(`## ${project.name}`);
    lines.push('');
    lines.push(`ID:          ${project.id}`);
    lines.push(`Progress:    ${Math.round(project.progress * 100)}%`);
    if (project.startDate) lines.push(`Start Date:  ${project.startDate.substring(0, 10)}`);
    if (project.targetDate) lines.push(`Target Date: ${project.targetDate.substring(0, 10)}`);
    lines.push(`URL:         ${project.url}`);

    if (project.description) {
      lines.push('');
      lines.push('### Description');
      lines.push('');
      lines.push(project.description);
    }

    return lines.join('\n');
  }

  static formatCycleList(result: ListResult<Cycle>): string {
    const lines: string[] = [];

    lines.push(`## Cycles (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No cycles found.');
      return lines.join('\n');
    }

    lines.push('| ID | Title | URL |');
    lines.push('|----|-------|-----|');

    result.items.forEach(cycle => {
      // Use name as title, or "Unnamed" if empty
      const title = cycle.name || 'Unnamed';
      lines.push(`| ${cycle.id} | ${title} | ${cycle.url} |`);
    });

    return lines.join('\n');
  }

  static formatCycleDetail(cycle: Cycle): string {
    const lines: string[] = [];

    lines.push(`## ${cycle.name}`);
    lines.push('');
    lines.push(`ID:        ${cycle.id}`);
    lines.push(`Starts:    ${cycle.startsAt.substring(0, 10)}`);
    lines.push(`Ends:      ${cycle.endsAt.substring(0, 10)}`);
    lines.push(`Progress:  ${Math.round(cycle.progress * 100)}%`);
    lines.push(`URL:       ${cycle.url}`);

    return lines.join('\n');
  }

  static formatTeamList(result: ListResult<Team>): string {
    const lines: string[] = [];

    lines.push(`## Teams (${result.items.length} results)`);
    lines.push('');

    if (result.items.length === 0) {
      lines.push('No teams found.');
      return lines.join('\n');
    }

    lines.push('| ID | Title | URL |');
    lines.push('|----|-------|-----|');

    result.items.forEach(team => {
      lines.push(`| ${team.id} | ${team.name} | ${team.url} |`);
    });

    return lines.join('\n');
  }

}
