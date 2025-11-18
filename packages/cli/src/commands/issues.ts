import { Command } from 'commander';
import { LinearClient } from '../lib/client.js';
import { Config, EnvironmentConfig } from '../config/types.js';
import { MarkdownFormatter, JSONFormatter, Issue, ListResult } from '../lib/formatters/index.js';
import { NotFoundError } from '../lib/errors.js';
import { extractIssueIdentifier } from '../lib/url-parser.js';

export function createIssuesCommand(
  env: EnvironmentConfig,
  config: Config,
  debug: boolean
): Command {
  const command = new Command('issues');
  command.description('Manage issues');

  // issues list
  command
    .command('list')
    .description('List issues')
    .option('--limit <number>', 'number of results per page', config.defaults.limit.toString())
    .option('--cursor <cursor>', 'pagination cursor')
    .option('--fetch-all', 'fetch all pages')
    .action(async (options) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const limit = parseInt(options.limit);
        let allIssues: Issue[] = [];
        let cursor: string | undefined = options.cursor;
        let hasNextPage = true;

        do {
          const response = await client.executeQuery(async (sdk) => {
            return sdk.issues({
              first: limit,
              after: cursor,
            });
          });

          const issues: Issue[] = await Promise.all(response.nodes.map(async (issue: any) => {
            const state = await issue.state;
            const assignee = await issue.assignee;
            return {
              id: issue.identifier,
              title: issue.title,
              status: state?.name || 'Unknown',
              assignee: assignee?.name,
              priority: issue.priorityLabel,
              createdAt: new Date(issue.createdAt).toISOString().substring(0, 10),
              updatedAt: issue.updatedAt ? new Date(issue.updatedAt).toISOString().substring(0, 10) : undefined,
              url: issue.url,
            };
          }));

          allIssues = allIssues.concat(issues);
          hasNextPage = response.pageInfo.hasNextPage;
          cursor = response.pageInfo.endCursor;

          if (!options.fetchAll) break;
        } while (hasNextPage);

        const result: ListResult<Issue> = {
          items: allIssues,
          pagination: options.fetchAll ? undefined : {
            hasNextPage,
            endCursor: cursor,
          },
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(result));
        } else {
          console.log(MarkdownFormatter.formatIssueList(result));
        }
      } catch (error) {
        throw error;
      }
    });

  // issues show
  command
    .command('show <idOrUrl>')
    .description('Show issue details (accepts identifier like ENG-123 or Linear URL)')
    .action(async (idOrUrl: string) => {
      const format = command.parent?.opts().format || 'markdown';
      const client = new LinearClient({ env, config, debug });

      try {
        const identifier = extractIssueIdentifier(idOrUrl);
        const response = await client.executeQuery(async (sdk) => {
          return sdk.issue(identifier);
        });

        if (!response) {
          throw new NotFoundError(`Issue ${identifier} not found`, { id: identifier });
        }

        const state = await response.state;
        const assignee = await response.assignee;
        const project = await response.project;
        const cycle = await response.cycle;

        const issue: Issue = {
          id: response.identifier,
          title: response.title,
          status: state?.name || 'Unknown',
          assignee: assignee?.name,
          priority: response.priorityLabel,
          createdAt: new Date(response.createdAt).toISOString().substring(0, 10),
          updatedAt: response.updatedAt ? new Date(response.updatedAt).toISOString().substring(0, 10) : undefined,
          url: response.url,
          description: response.description,
          project: project?.name,
          cycle: cycle?.name,
        };

        if (format === 'json') {
          console.log(JSONFormatter.format(issue));
        } else {
          console.log(MarkdownFormatter.formatIssueDetail(issue));
        }
      } catch (error) {
        throw error;
      }
    });

  return command;
}
