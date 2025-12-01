/**
 * Linear GraphQL API type definitions
 */

export interface LinearIssue {
  id: string;
  identifier: string;
  number?: number;
  title: string;
  description?: string;
  priority: number;
  priorityLabel: string;
  estimate?: number;
  dueDate?: string;
  branchName?: string;
  state: LinearWorkflowState;
  assignee?: LinearUser;
  creator?: LinearUser;
  team?: LinearTeam;
  project?: LinearProject;
  cycle?: LinearCycle;
  parent?: {
    identifier: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  archivedAt?: string;
  snoozedUntilAt?: string;
  trashed?: boolean;
  url: string;
}

export interface LinearProject {
  id: string;
  name: string;
  slugId?: string;
  description?: string;
  state: string;
  status?: {
    name: string;
    type: string;
    color?: string;
    description?: string;
  };
  progress: number;
  priority?: number;
  priorityLabel?: string;
  health?: string;
  scope?: number;
  color?: string;
  icon?: string;
  startDate?: string;
  targetDate?: string;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  trashed?: boolean;
  lead?: LinearUser;
  creator?: LinearUser;
  url: string;
}

export interface LinearTeam {
  id: string;
  key: string;
  name: string;
  displayName?: string;
  description?: string;
  color?: string;
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
  description?: string;
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
