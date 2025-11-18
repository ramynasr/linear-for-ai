import chalk from 'chalk';

export class DebugLogger {
  constructor(private enabled: boolean) {}

  static redactApiKey(key: string): string {
    if (key.length <= 4) return '***';
    return `LINEAR_...${key.slice(-4)}`;
  }

  static redactHeaders(headers: Record<string, string>): Record<string, string> {
    const redacted = { ...headers };

    if (redacted.Authorization) {
      const match = redacted.Authorization.match(/Bearer (.+)/);
      if (match) {
        redacted.Authorization = `Bearer ${this.redactApiKey(match[1])}`;
      }
    }

    return redacted;
  }

  logRequest(method: string, url: string, headers: Record<string, string>, body?: unknown): void {
    if (!this.enabled) return;

    console.error(chalk.cyan('[DEBUG] GraphQL Request'));
    console.error(`${method} ${url}`);
    console.error(chalk.gray('Headers:'));
    const redactedHeaders = DebugLogger.redactHeaders(headers);
    Object.entries(redactedHeaders).forEach(([key, value]) => {
      console.error(chalk.gray(`  ${key}: ${value}`));
    });

    if (body) {
      console.error(chalk.gray('Body:'));
      console.error(JSON.stringify(body, null, 2));
    }
    console.error('');
  }

  logResponse(status: number, statusText: string, body: unknown, duration: number): void {
    if (!this.enabled) return;

    console.error(chalk.cyan(`[DEBUG] GraphQL Response (${duration}ms)`));
    console.error(`Status: ${status} ${statusText}`);
    console.error(chalk.gray('Body:'));
    console.error(JSON.stringify(body, null, 2));
    console.error('');
  }

  logError(error: Error): void {
    if (!this.enabled) return;

    console.error(chalk.red('[DEBUG] Error'));
    console.error(error.message);
    if (error.stack) {
      console.error(chalk.gray(error.stack));
    }
    console.error('');
  }
}
