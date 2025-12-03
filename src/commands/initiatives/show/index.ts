import type { GraphQLClient } from '../../../lib/graphql-client.ts';
import type { LinearInitiative } from '../types.ts';
import type { CommandContext, ShowOptions } from '../../../types/cli.ts';
import { buildQuery } from './query.ts';
import { formatInitiativeDetail } from './formatter.ts';
import { getFieldsOrDefault } from '../../../lib/utils/command.ts';
import { extractInitiativeIdentifier } from '../../../lib/utils/url.ts';

/**
 * Show initiative detail command
 */
export async function show(
  client: GraphQLClient,
  context: CommandContext<ShowOptions>,
): Promise<string> {
  if (context.args.length !== 1) {
    throw new Error('Exactly one initiative identifier is required for the show command');
  }

  const rawIdentifier = context.args[0];
  const identifier = extractInitiativeIdentifier(rawIdentifier);

  const options = context.options;

  // Default fields for show command (more detailed than list)
  const defaultFields = [
    'id',
    'name',
    'status',
    'slugId',
    'url',
    'description',
    'content',
    'health',
    'createdAt',
    'owner',
    'creator',
    'lastUpdate',
    'projects',
    'subInitiatives',
  ];

  const fields = getFieldsOrDefault(
    options.fields,
    context.config.defaults.fields.initiatives || defaultFields,
  );

  const query = buildQuery(identifier, fields);

  const response = await client.query<{ initiative: LinearInitiative }>({ query });

  if (!response.data?.initiative) {
    throw new Error(`Initiative not found: ${rawIdentifier}`);
  }

  const format = options.format || context.config.defaults.format;
  return formatInitiativeDetail(response.data.initiative, format);
}
