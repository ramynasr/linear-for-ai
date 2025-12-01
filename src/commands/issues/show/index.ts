import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearIssue } from '../../../types/linear.ts';
import type { CommandContext, ShowOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatIssueDetail } from './formatter.ts';
import { getFieldsOrDefault } from '../../../lib/utils/command.ts';

/**
 * Show issue detail command
 */
export async function show(
  client: GraphQLClient,
  context: CommandContext,
): Promise<string> {
  const identifier = context.args[0];
  if (!identifier) {
    throw new Error('Issue identifier required for show command');
  }

  const options = context.options as ShowOptions;
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.issues,
  );

  const query = buildQuery(identifier, fields);

  const response = await client.query<{ issue: LinearIssue }>({ query });

  if (!response.data?.issue) {
    throw new Error(`Issue not found: ${identifier}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatIssueDetail(response.data.issue, format);
}
