import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { LinearConnection, LinearIssue } from '../types/linear.ts';
import type { CommandContext, ListOptions, ShowOptions } from '../types/cli.ts';
import { buildIssuesListQuery, buildIssueShowQuery } from '../lib/queries/issues.ts';
import { formatIssuesList, formatIssueDetail } from '../lib/formatters/issues.ts';

/**
 * List issues command
 */
export async function issuesList(
  client: GraphQLClient,
  context: CommandContext,
  options: ListOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.issues;
  const limit = options.limit || context.config.defaults.limit;

  const query = buildIssuesListQuery({
    fields,
    limit,
    cursor: options.cursor,
  });

  const response = await client.query<{ issues: LinearConnection<LinearIssue> }>({
    query,
  });

  if (!response.data) {
    throw new Error('No data returned from API');
  }

  const format = options.format || context.config.defaults.format;
  return formatIssuesList(response.data.issues, format);
}

/**
 * Show issue detail command
 */
export async function issuesShow(
  client: GraphQLClient,
  context: CommandContext,
  identifier: string,
  options: ShowOptions = {},
): Promise<string> {
  const fields = options.fields?.split(',') || context.config.defaults.fields.issues;

  const query = buildIssueShowQuery(identifier, fields);

  const response = await client.query<{ issue: LinearIssue }>({
    query,
  });

  if (!response.data?.issue) {
    throw new Error(`Issue not found: ${identifier}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatIssueDetail(response.data.issue, format);
}
