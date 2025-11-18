export enum ErrorCode {
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GRAPHQL_ERROR = 'GRAPHQL_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
}

export class LinearForAIError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LinearForAIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.AUTH_ERROR, message, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.NOT_FOUND, message, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.RATE_LIMIT, message, details);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.NETWORK_ERROR, message, details);
    this.name = 'NetworkError';
  }
}

export class GraphQLError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.GRAPHQL_ERROR, message, details);
    this.name = 'GraphQLError';
  }
}

export class ConfigError extends LinearForAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.CONFIG_ERROR, message, details);
    this.name = 'ConfigError';
  }
}
