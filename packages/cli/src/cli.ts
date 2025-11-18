#!/usr/bin/env node
import { Command } from 'commander';
import { ConfigLoader } from './config/loader.js';
import { ErrorFormatter } from './lib/error-formatter.js';
import { Config, EnvironmentConfig } from './config/types.js';
import { createIssuesCommand } from './commands/issues.js';
import { createProjectsCommand } from './commands/projects.js';
import { LinearClient } from './lib/client.js';

const program = new Command();

program
  .name('linear-for-ai')
  .description('CLI tool for AI agents to interact with Linear GraphQL API')
  .version('0.1.0');

// Global options
program
  .option('--format <format>', 'output format (markdown|json)', 'markdown')
  .option('--debug', 'enable debug mode with request/response logging', false)
  .option('--config <path>', 'custom config file path')
  .option('--no-color', 'disable ANSI colors in output');

// Async main function to handle config loading
async function main() {
  const opts = program.opts();
  const format = opts.format as 'markdown' | 'json';

  try {
    // Load environment and config
    const env: EnvironmentConfig = ConfigLoader.loadEnvironment();
    const config: Config = await ConfigLoader.loadConfig(opts.config);
    const finalConfig = ConfigLoader.applyProxyFromEnvironment(config, env);

    // Add resource commands
    program.addCommand(createIssuesCommand(env, finalConfig, opts.debug));
    program.addCommand(createProjectsCommand(env, finalConfig, opts.debug));

    // Placeholder commands - will be implemented in later phases

    program
      .command('cycles')
      .description('Manage cycles')
      .action(() => {
        console.log('Cycles commands not yet implemented');
        process.exit(0);
      });

    program
      .command('teams')
      .description('Manage teams')
      .action(() => {
        console.log('Teams commands not yet implemented');
        process.exit(0);
      });

    // Test connection command
    program
      .command('test-connection')
      .description('Test connection to Linear API')
      .action(async () => {
        try {
          const client = new LinearClient({
            env,
            config: finalConfig,
            debug: opts.debug,
          });

          const success = await client.testConnection();

          if (success) {
            if (format === 'json') {
              console.log(JSON.stringify({ success: true, message: 'Connected to Linear API' }, null, 2));
            } else {
              console.log('✓ Successfully connected to Linear API');
            }
            process.exit(0);
          } else {
            throw new Error('Connection test failed');
          }
        } catch (error) {
          ErrorFormatter.handleError(error as Error, format);
        }
      });

    // Parse arguments
    await program.parseAsync();
  } catch (error) {
    ErrorFormatter.handleError(error as Error, format);
  }
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
