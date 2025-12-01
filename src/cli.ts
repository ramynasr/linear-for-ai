#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

import { parseArgs } from './lib/cli-parser.ts';
import { loadEnvironment } from './lib/env.ts';
import { loadConfig } from './lib/config.ts';
import { GraphQLClient } from './lib/graphql-client.ts';
import { CommandFactory } from './commands/factory.ts';
import { HELP_TEXT, VERSION } from './lib/help.ts';
import type { CommandContext } from './types/cli.ts';

async function main() {
  const parsed = parseArgs(Deno.args);

  // Show help
  if (parsed.showHelp) {
    console.log(HELP_TEXT);
    Deno.exit(0);
  }

  // Show version
  if (parsed.showVersion) {
    console.log(`linear-for-ai v${VERSION}`);
    Deno.exit(0);
  }

  try {
    // Load environment and config
    const env = await loadEnvironment();
    const config = await loadConfig(parsed.options.config);

    // Create GraphQL client
    const client = new GraphQLClient(env.apiKey, {
      debug: parsed.options.debug,
      proxy: env.httpsProxy || env.httpProxy,
    });

    // Validate resource and action are present
    if (!parsed.resource || !parsed.action) {
      console.error('Error: Resource and action are required');
      console.log(HELP_TEXT);
      Deno.exit(1);
    }

    // Build command context
    const context: CommandContext = {
      config,
      env,
      options: parsed.options,
      args: parsed.args,
    };

    // Get command handler from factory
    const handler = CommandFactory.get(parsed.resource, parsed.action);

    if (!handler) {
      throw new Error(`Unknown command: ${parsed.resource} ${parsed.action}`);
    }

    const output = await handler(client, context);

    // Output result
    console.log(output);
  } catch (error) {
    const err = error as Error;
    console.error(`Error: ${err.message}`);
    if (parsed.options.debug) {
      console.error(err.stack);
    }
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
