import type { GraphQLClient } from '../lib/graphql-client.ts';
import type { LinearConnection, LinearIssue } from '../types/linear.ts';
import type { CommandContext, ListOptions, ShowOptions } from '../types/cli.ts';
import { buildIssueShowQuery, buildIssuesListQuery } from '../lib/queries/issues.ts';
import { formatIssuesList } from './issues/list/formatter.ts';
import { formatIssueDetail } from './issues/show/formatter.ts';

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

  // Parse filter if provided
  let filter: Record<string, unknown> | undefined;
  if (options.filter) {
    try {
      filter = JSON.parse(options.filter);
    } catch (error) {
      throw new Error(`Invalid filter JSON: ${(error as Error).message}`);
    }
  }

  const query = buildIssuesListQuery({
    fields,
    limit,
    cursor: options.cursor,
    filter,
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
