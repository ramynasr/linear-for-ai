import { Config } from './types.js';

export const DEFAULT_CONFIG: Config = {
  allowWrites: false,
  proxy: {
    enabled: false,
  },
  defaults: {
    format: 'markdown',
    limit: 50,
    fields: {
      issue: ['id', 'title', 'status', 'assignee', 'priority', 'createdAt', 'url'],
      project: ['id', 'name', 'progress', 'startDate', 'targetDate', 'url'],
      cycle: ['id', 'name', 'startsAt', 'endsAt', 'progress', 'url'],
    },
  },
  cache: {
    enabled: true,
    ttl: 300,
  },
};
