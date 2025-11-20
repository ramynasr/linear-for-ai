#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

import { parseArgs } from './lib/cli-parser.ts';
import { loadEnvironment } from './lib/env.ts';
import { loadConfig } from './lib/config.ts';
import { GraphQLClient } from './lib/graphql-client.ts';
import { issuesList, issuesShow } from './commands/issues.ts';
import { projectsList, projectsShow } from './commands/projects.ts';
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

    // Build command context
    const context: CommandContext = {
      config,
      env,
      options: parsed.options,
    };

    // Route to command handler
    let output: string;

    if (parsed.resource === 'issues') {
      if (parsed.action === 'list') {
        output = await issuesList(client, context, parsed.options);
      } else if (parsed.action === 'show') {
        if (!parsed.args[0]) {
          throw new Error('Issue identifier required for show command');
        }
        output = await issuesShow(client, context, parsed.args[0], parsed.options);
      } else {
        throw new Error(`Unknown action for issues: ${parsed.action}`);
      }
    } else if (parsed.resource === 'projects') {
      if (parsed.action === 'list') {
        output = await projectsList(client, context, parsed.options);
      } else if (parsed.action === 'show') {
        if (!parsed.args[0]) {
          throw new Error('Project ID required for show command');
        }
        output = await projectsShow(client, context, parsed.args[0], parsed.options);
      } else {
        throw new Error(`Unknown action for projects: ${parsed.action}`);
      }
    } else {
      throw new Error(`Unknown resource: ${parsed.resource}`);
    }

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
