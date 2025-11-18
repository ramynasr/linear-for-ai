import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Team, ListResult } from '../lib/formatters/index.js';

export function createTeamsCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('teams');
  command.description('Manage teams');

  // teams list
  command
    .command('list')
    .description('List teams')
    .action(async () => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const response = await client.executeQuery(async (sdk) => {
          return sdk.teams();
        });

        const teams: Team[] = response.nodes.map((team: any) => ({
          id: team.id,
          name: team.name,
          key: team.key,
          description: team.description,
        }));

        const result: ListResult<Team> = {
          items: teams,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatTeamList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
