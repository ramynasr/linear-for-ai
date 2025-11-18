import { LinearClient as LinearSDK } from '@linear/sdk';
import { EnvironmentConfig, Config } from '../config/types.js';
import { AuthError, NetworkError, RateLimitError } from './errors.js';
import { DebugLogger } from './debug.js';

export interface LinearClientOptions {
  env: EnvironmentConfig;
  config: Config;
  debug: boolean;
}

export class LinearClient {
  private sdk: LinearSDK;
  private debug: DebugLogger;

  constructor(private options: LinearClientOptions) {
    this.debug = new DebugLogger(options.debug);

    // Configure proxy if enabled
    if (options.config.proxy.enabled && options.config.proxy.url) {
      // Note: fetch doesn't natively support proxy, would need http-proxy-agent
      // For now, rely on HTTPS_PROXY environment variable
      this.debug.logRequest(
        'INFO',
        'Proxy configured',
        { 'Proxy-URL': options.config.proxy.url },
        undefined
      );
    }

    try {
      this.sdk = new LinearSDK({
        apiKey: options.env.apiKey,
      });
    } catch (error) {
      throw new AuthError(
        'Failed to initialize Linear client',
        { error: (error as Error).message }
      );
    }
  }

  get client(): LinearSDK {
    return this.sdk;
  }

  async executeQuery<T>(
    queryFn: (client: LinearSDK) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFn(this.sdk);
      const duration = Date.now() - startTime;

      if (this.options.debug) {
        this.debug.logResponse(200, 'OK', result, duration);
      }

      return result;
    } catch (error) {
      this.debug.logError(error as Error);

      // Map Linear SDK errors to our error types
      const err = error as Error;

      if (err.message.includes('Unauthorized') || err.message.includes('Invalid API key')) {
        throw new AuthError('Invalid or missing API key', {
          originalError: err.message
        });
      }

      if (err.message.includes('Rate limit')) {
        throw new RateLimitError('API rate limit exceeded', {
          originalError: err.message
        });
      }

      if (err.message.includes('Network') || err.message.includes('ENOTFOUND')) {
        throw new NetworkError('Network request failed', {
          originalError: err.message
        });
      }

      throw new NetworkError('Linear API request failed', {
        originalError: err.message
      });
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const viewer = await this.executeQuery(client => client.viewer);
      this.debug.logRequest(
        'GET',
        'https://api.linear.app/graphql',
        { 'Authorization': `Bearer ${DebugLogger.redactApiKey(this.options.env.apiKey)}` },
        { query: 'query { viewer { id name email } }' }
      );
      return !!viewer;
    } catch (error) {
      return false;
    }
  }
}
