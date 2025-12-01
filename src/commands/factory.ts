import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { CommandContext } from '../types/cli.ts';
import { list as issuesList } from './issues/list/index.ts';
import { show as issuesShow } from './issues/show/index.ts';
import { list as projectsList } from './projects/list/index.ts';
import { show as projectsShow } from './projects/show/index.ts';
import { showMyUpdates as projectsShowMyUpdates } from './projects/show-my-updates/index.ts';
import { list as notificationsList } from './notifications/list/index.ts';

export type CommandHandler<TOptions = Record<string, unknown>> = (
  client: GraphQLClient,
  context: CommandContext<TOptions>,
) => Promise<string>;

const commandMap: Record<string, Record<string, CommandHandler>> = {
  issues: {
    list: issuesList,
    show: issuesShow,
  },
  projects: {
    list: projectsList,
    show: projectsShow,
    'show-my-updates': projectsShowMyUpdates,
  },
  notifications: {
    list: notificationsList,
  },
};

export class CommandFactory {
  static get(resource: string, action: string): CommandHandler | undefined {
    return commandMap[resource]?.[action];
  }
}
