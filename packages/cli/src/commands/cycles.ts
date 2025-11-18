import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Cycle, ListResult } from '../lib/formatters/index.js';
import { NotFoundError } from '../lib/errors.js';

export function createCyclesCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('cycles');
  command.description('Manage cycles');

  // cycles list
  command
    .command('list')
    .description('List cycles')
    .option('--limit <number>', 'number of results per page', config.defaults.limit.toString())
    .option('--cursor <cursor>', 'pagination cursor')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const limit = parseInt(options.limit);
        const response = await client.executeQuery(async (sdk) => {
          return sdk.cycles({
            first: limit,
            after: options.cursor,
          });
        });

        const cycles: Cycle[] = response.nodes.map((cycle: any) => ({
          id: cycle.id || '',
          name: cycle.name || '',
          startsAt: cycle.startsAt.toISOString(),
          endsAt: cycle.endsAt.toISOString(),
          progress: cycle.progress,
          url: `https://linear.app/cycle/${cycle.id}`,
        }));

        const result: ListResult<Cycle> = {
          items: cycles,
          pagination: {
            hasNextPage: response.pageInfo.hasNextPage,
            endCursor: response.pageInfo.endCursor,
          },
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatCycleList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  // cycles show
  command
    .command('show <id>')
    .description('Show cycle details')
    .action(async (id: string) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const response = await client.executeQuery(async (sdk) => {
          return sdk.cycle(id);
        });

        if (!response) {
          throw new NotFoundError(`Cycle ${id} not found`, { id });
        }

        const cycle: Cycle = {
          id: response.id || '',
          name: response.name || '',
          startsAt: response.startsAt.toISOString(),
          endsAt: response.endsAt.toISOString(),
          progress: response.progress,
          url: `https://linear.app/cycle/${response.id}`,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(cycle));
        } else {
          console.log(MarkdownFormatter.formatCycleDetail(cycle));
        }
      } catch (error) {
        throw error;
      }
    });

  // cycles current
  command
    .command('current')
    .description('Show current cycle')
    .option('--team <id>', 'team ID')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        // Get all cycles and find the current one
        const response = await client.executeQuery(async (sdk) => {
          return sdk.cycles({
            first: 50,
            filter: options.team ? { team: { id: { eq: options.team } } } : undefined,
          });
        });

        const now = new Date();
        const currentCycle = response.nodes.find((cycle: any) => {
          const starts = new Date(cycle.startsAt);
          const ends = new Date(cycle.endsAt);
          return starts <= now && now <= ends;
        });

        if (!currentCycle) {
          throw new NotFoundError('No current cycle found', {});
        }

        const cycle: Cycle = {
          id: currentCycle.id || '',
          name: currentCycle.name || '',
          startsAt: currentCycle.startsAt.toISOString(),
          endsAt: currentCycle.endsAt.toISOString(),
          progress: currentCycle.progress,
          url: `https://linear.app/cycle/${currentCycle.id}`,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(cycle));
        } else {
          console.log(MarkdownFormatter.formatCycleDetail(cycle));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
