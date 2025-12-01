import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearProject } from '../../../types/linear.ts';
import type { CommandContext, ShowOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatProjectDetail } from './formatter.ts';
import { getFieldsOrDefault } from '../../../lib/utils/command.ts';

export async function show(
  client: GraphQLClient,
  context: CommandContext<ShowOptions>,
): Promise<string> {
  const id = context.args[0];
  if (!id) {
    throw new Error('Project ID required for show command');
  }

  const options = context.options;
  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.projects,
  );

  const query = buildQuery(id, fields);

  const response = await client.query<{ project: LinearProject }>({ query });

  if (!response.data?.project) {
    throw new Error(`Project not found: ${id}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatProjectDetail(response.data.project, format);
}
