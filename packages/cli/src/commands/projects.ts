import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Project, ListResult } from '../lib/formatters/index.js';
import { NotFoundError } from '../lib/errors.js';

export function createProjectsCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('projects');
  command.description('Manage projects');

  // projects list
  command
    .command('list')
    .description('List projects')
    .option('--limit <number>', 'number of results per page', config.defaults.limit.toString())
    .option('--cursor <cursor>', 'pagination cursor')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const limit = parseInt(options.limit);
        const response = await client.executeQuery(async (sdk) => {
          return sdk.projects({
            first: limit,
            after: options.cursor,
          });
        });

        const projects: Project[] = response.nodes.map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          progress: project.progress,
          startDate: project.startDate,
          targetDate: project.targetDate,
          url: project.url,
        }));

        const result: ListResult<Project> = {
          items: projects,
          pagination: {
            hasNextPage: response.pageInfo.hasNextPage,
            endCursor: response.pageInfo.endCursor,
          },
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatProjectList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  // projects show
  command
    .command('show <id>')
    .description('Show project details')
    .action(async (id: string) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const response = await client.executeQuery(async (sdk) => {
          return sdk.project(id);
        });

        if (!response) {
          throw new NotFoundError(`Project ${id} not found`, { id });
        }

        const project: Project = {
          id: response.id,
          name: response.name,
          description: response.description,
          progress: response.progress,
          startDate: response.startDate,
          targetDate: response.targetDate,
          url: response.url,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(project));
        } else {
          console.log(MarkdownFormatter.formatProjectDetail(project));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
