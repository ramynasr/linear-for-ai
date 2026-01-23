import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { CommandContext } from '../types/cli.ts';
import { list as issuesList } from './issues/list/index.ts';
import { show as issuesShow } from './issues/show/index.ts';
import { list as projectsList } from './projects/list/index.ts';
import { show as projectsShow } from './projects/show/index.ts';
import { showUpdates as projectsShowUpdates } from './projects/show-updates/index.ts';
import { list as notificationsList } from './notifications/list/index.ts';
import { list as initiativesList } from './initiatives/list/index.ts';
import { show as initiativesShow } from './initiatives/show/index.ts';

export type CommandHandler<TOptions = Record<string, unknown>> = (
  client: GraphQLClient,
  context: CommandContext<TOptions>,
) => Promise<string>;

export interface CommandOption {
  name: string;
  description: string;
  type?: 'string' | 'boolean' | 'number';
}

export interface ActionMetadata {
  description: string;
  usage: string;
  options?: CommandOption[];
}

export interface ResourceMetadata {
  description: string;
  actions: Record<string, ActionMetadata>;
}

const resourceMetadata: Record<string, ResourceMetadata> = {
  issues: {
    description: 'Manage and query issues',
    actions: {
      list: {
        description: 'List issues (by default shows only issues related to you)',
        usage: 'linear-for-ai issues list [options]',
        options: [
          { name: '--filter <json>', description: 'Filter using Linear filter syntax' },
          { name: '--limit <number>', description: 'Maximum results per page (default: 50)' },
          { name: '--fetch-all', description: 'Show all issues, not just ones related to you' },
          { name: '--fields <fields>', description: 'Override default field selection' },
          { name: '--cursor <cursor>', description: 'Pagination cursor for next page' },
        ],
      },
      show: {
        description: 'Show details of a specific issue',
        usage: 'linear-for-ai issues show <id|url>',
        options: [
          { name: '--fields <fields>', description: 'Override default field selection' },
        ],
      },
    },
  },
  projects: {
    description: 'Manage and query projects',
    actions: {
      list: {
        description: 'List projects (by default shows only projects related to you)',
        usage: 'linear-for-ai projects list [options]',
        options: [
          { name: '--filter <json>', description: 'Filter using Linear filter syntax' },
          { name: '--limit <number>', description: 'Maximum results per page (default: 50)' },
          { name: '--fetch-all', description: 'Show all projects, not just ones related to you' },
          { name: '--show-completed', description: 'Include completed projects (excluded by default)' },
          { name: '--fields <fields>', description: 'Override default field selection' },
          { name: '--cursor <cursor>', description: 'Pagination cursor for next page' },
        ],
      },
      show: {
        description: 'Show details of a specific project',
        usage: 'linear-for-ai projects show <id|url>',
        options: [
          { name: '--fields <fields>', description: 'Override default field selection' },
        ],
      },
      'show-updates': {
        description: 'Show recent updates and activity for projects',
        usage: 'linear-for-ai projects show-updates [id|url] [options]',
        options: [
          { name: '--since <date>', description: 'Show updates since date (YYYY-MM-DD, default: 14 days ago)' },
          { name: '--limit <number>', description: 'Maximum projects to show (default: 10)' },
          { name: '--show-all-issue-updates', description: 'Show all issue updates, not just your own' },
          { name: '--cursor <cursor>', description: 'Pagination cursor for next page' },
        ],
      },
    },
  },
  initiatives: {
    description: 'Manage and query initiatives',
    actions: {
      list: {
        description: 'List initiatives (by default shows only initiatives owned by you)',
        usage: 'linear-for-ai initiatives list [options]',
        options: [
          { name: '--filter <json>', description: 'Filter using Linear filter syntax' },
          { name: '--limit <number>', description: 'Maximum results per page (default: 50)' },
          { name: '--fetch-all', description: 'Show all initiatives, not just ones you own' },
          { name: '--fields <fields>', description: 'Override default field selection' },
          { name: '--cursor <cursor>', description: 'Pagination cursor for next page' },
        ],
      },
      show: {
        description: 'Show details of a specific initiative',
        usage: 'linear-for-ai initiatives show <id|slugId>',
        options: [
          { name: '--fields <fields>', description: 'Override default field selection' },
        ],
      },
    },
  },
  notifications: {
    description: 'Query user notifications',
    actions: {
      list: {
        description: 'List your recent notifications',
        usage: 'linear-for-ai notifications list [options]',
        options: [
          { name: '--limit <number>', description: 'Maximum results per page (default: 50)' },
          { name: '--cursor <cursor>', description: 'Pagination cursor for next page' },
        ],
      },
    },
  },
};

const commandMap: Record<string, Record<string, CommandHandler>> = {
  issues: {
    list: issuesList,
    show: issuesShow,
  },
  projects: {
    list: projectsList,
    show: projectsShow,
    'show-updates': projectsShowUpdates,
  },
  notifications: {
    list: notificationsList,
  },
  initiatives: {
    list: initiativesList,
    show: initiativesShow,
  },
};

export class CommandFactory {
  static get(resource: string, action: string): CommandHandler | undefined {
    return commandMap[resource]?.[action];
  }

  static getResourceMetadata(resource: string): ResourceMetadata | undefined {
    return resourceMetadata[resource];
  }

  static getAvailableResources(): string[] {
    return Object.keys(resourceMetadata);
  }

  static hasResource(resource: string): boolean {
    return resource in resourceMetadata;
  }
}
