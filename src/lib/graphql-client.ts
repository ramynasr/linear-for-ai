import { redactApiKey } from './env.ts';
import type { LinearResponse } from '../types/linear.ts';

export interface GraphQLClientOptions {
  debug?: boolean;
  proxy?: string;
}

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

export class GraphQLClient {
  private readonly apiKey: string;
  private readonly endpoint = 'https://api.linear.app/graphql';
  private readonly options: GraphQLClientOptions;

  constructor(apiKey: string, options: GraphQLClientOptions = {}) {
    this.apiKey = apiKey;
    this.options = options;
  }

  /**
   * Get redacted API key for debug output
   */
  getRedactedKey(): string {
    return redactApiKey(this.apiKey);
  }

  /**
   * Get request headers
   */
  getHeaders(): Headers {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${this.apiKey}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  }

  /**
   * Execute a GraphQL query
   */
  async query<T>(request: GraphQLRequest): Promise<LinearResponse<T>> {
    const startTime = Date.now();

    if (this.options.debug) {
      this.logRequest(request);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      const data = await response.json() as LinearResponse<T>;

      if (this.options.debug) {
        this.logResponse(data, Date.now() - startTime);
      }

      if (data.errors) {
        throw new GraphQLError(data.errors);
      }

      return data;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown network error';
      throw new NetworkError(message);
    }
  }

  private logRequest(request: GraphQLRequest): void {
    console.error('\n[DEBUG] GraphQL Request');
    console.error(`POST ${this.endpoint}`);
    console.error('Headers:');
    console.error(`  Authorization: Bearer ${this.getRedactedKey()}`);
    console.error(`  Content-Type: application/json`);
    console.error('Body:');
    console.error(JSON.stringify(request, null, 2));
  }

  private logResponse(data: unknown, duration: number): void {
    console.error(`\n[DEBUG] GraphQL Response (${duration}ms)`);
    console.error('Body:');
    console.error(JSON.stringify(data, null, 2));
  }
}

export class GraphQLError extends Error {
  constructor(public errors: Array<{ message: string; extensions?: Record<string, unknown> }>) {
    super(errors.map((e) => e.message).join(', '));
    this.name = 'GraphQLError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
