/**
 * Linear GraphQL API type definitions
 */

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority: number;
  priorityLabel: string;
  state: LinearWorkflowState;
  assignee?: LinearUser;
  project?: LinearProject;
  cycle?: LinearCycle;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
  lead?: LinearUser;
  url: string;
}

export interface LinearTeam {
  id: string;
  key: string;
  name: string;
  description?: string;
  url: string;
}

export interface LinearCycle {
  id: string;
  number: number;
  name?: string;
  startsAt: string;
  endsAt: string;
  url: string;
}

export interface LinearWorkflowState {
  id: string;
  name: string;
  type: string;
  color: string;
}

export interface LinearUser {
  id: string;
  name: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export interface LinearNotification {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  category: string;
  url: string;
  inboxUrl: string;
  actor?: LinearUser;
  readAt?: string;
  snoozedUntilAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinearPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface LinearConnection<T> {
  nodes: T[];
  pageInfo: LinearPageInfo;
}

export interface LinearError {
  message: string;
  extensions?: {
    code: string;
    [key: string]: unknown;
  };
}

export interface LinearResponse<T> {
  data?: T;
  errors?: LinearError[];
}
