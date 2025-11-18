import chalk from 'chalk';
import { LinearForAIError } from './errors.js';

export class ErrorFormatter {
  static formatForHuman(error: Error | LinearForAIError): string {
    if (error instanceof LinearForAIError) {
      const lines = [
        chalk.red('❌ Error: ') + error.message,
        chalk.gray('Code: ') + error.code,
      ];

      if (error.details) {
        Object.entries(error.details).forEach(([key, value]) => {
          lines.push(chalk.gray(`${key}: `) + String(value));
        });
      }

      // Add suggestions based on error code
      const suggestion = this.getSuggestion(error.code);
      if (suggestion) {
        lines.push('');
        lines.push(chalk.yellow('Suggestion: ') + suggestion);
      }

      return lines.join('\n');
    }

    // Generic error
    return chalk.red('❌ Error: ') + error.message;
  }

  static formatForMachine(error: Error | LinearForAIError): string {
    if (error instanceof LinearForAIError) {
      return JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details || {},
        },
      }, null, 2);
    }

    return JSON.stringify({
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: {},
      },
    }, null, 2);
  }

  private static getSuggestion(code: string): string | null {
    const suggestions: Record<string, string> = {
      AUTH_ERROR: 'Check that LINEAR_API_KEY is set correctly in your environment',
      NOT_FOUND: 'Verify the resource ID exists and you have access to it',
      VALIDATION_ERROR: 'Check the command syntax and required parameters',
      RATE_LIMIT: 'Wait a moment before retrying. Consider reducing request frequency',
      NETWORK_ERROR: 'Check your internet connection and proxy settings',
      GRAPHQL_ERROR: 'The query may have invalid syntax or requested non-existent fields',
      CONFIG_ERROR: 'Check your config file at ~/.config/linear-for-ai/config.json',
    };

    return suggestions[code] || null;
  }

  static handleError(error: Error | LinearForAIError, format: 'markdown' | 'json'): never {
    // Write human-readable to stderr
    console.error(this.formatForHuman(error));

    // Write machine-readable to stdout if JSON format
    if (format === 'json') {
      console.log(this.formatForMachine(error));
    }

    // Exit with error code
    process.exit(1);
  }
}
