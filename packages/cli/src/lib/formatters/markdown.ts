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
    lines.push('ID        Title              Status        Assignee  Priority  URL');
    lines.push('--------  -----------------  ------------  --------  --------  -----------------------------------------');

    // Table rows
    result.items.forEach(issue => {
      const id = this.truncate(issue.id, 8);
      const title = this.truncate(issue.title, 17);
      const status = this.truncate(issue.status, 12);
      const assignee = this.truncate(issue.assignee || '-', 8);
      const priority = this.truncate(issue.priority || '-', 8);

      lines.push(
        `${this.pad(id, 8)}  ${this.pad(title, 17)}  ${this.pad(status, 12)}  ` +
        `${this.pad(assignee, 8)}  ${this.pad(priority, 8)}  ${issue.url}`
      );
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

    lines.push('ID        Name               Progress  Start Date  Target Date  URL');
    lines.push('--------  -----------------  --------  ----------  -----------  -----------------------------------------');

    result.items.forEach(project => {
      const id = this.truncate(project.id, 8);
      const name = this.truncate(project.name, 17);
      const progress = `${Math.round(project.progress * 100)}%`;
      const startDate = project.startDate ? project.startDate.substring(0, 10) : '-';
      const targetDate = project.targetDate ? project.targetDate.substring(0, 10) : '-';

      lines.push(
        `${this.pad(id, 8)}  ${this.pad(name, 17)}  ${this.pad(progress, 8)}  ` +
        `${this.pad(startDate, 10)}  ${this.pad(targetDate, 11)}  ${project.url}`
      );
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

    lines.push('ID        Name               Starts      Ends        Progress  URL');
    lines.push('--------  -----------------  ----------  ----------  --------  -----------------------------------------');

    result.items.forEach(cycle => {
      const id = this.truncate(cycle.id, 8);
      const name = this.truncate(cycle.name, 17);
      const starts = cycle.startsAt.substring(0, 10);
      const ends = cycle.endsAt.substring(0, 10);
      const progress = `${Math.round(cycle.progress * 100)}%`;

      lines.push(
        `${this.pad(id, 8)}  ${this.pad(name, 17)}  ${this.pad(starts, 10)}  ` +
        `${this.pad(ends, 10)}  ${this.pad(progress, 8)}  ${cycle.url}`
      );
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

    lines.push('ID        Key       Name');
    lines.push('--------  --------  --------------------------------------------------');

    result.items.forEach(team => {
      const id = this.truncate(team.id, 8);
      const key = this.truncate(team.key, 8);

      lines.push(`${this.pad(id, 8)}  ${this.pad(key, 8)}  ${team.name}`);
    });

    return lines.join('\n');
  }

  private static truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen - 3) + '...';
  }

  private static pad(str: string, width: number): string {
    return str + ' '.repeat(Math.max(0, width - str.length));
  }
}
