/**
 * Project command-specific types
 */

export interface ShowMyUpdatesOptions {
  since?: string;
  showAllIssueUpdates?: boolean;
  limit?: number;
  cursor?: string;
  format?: 'markdown' | 'json';
}

export interface ProjectUpdate {
  id: string;
  body: string;
  createdAt: string;
  url: string;
  user: {
    id: string;
    displayName: string;
  };
}

export interface ProjectIssue {
  id: string;
  identifier: string;
  title: string;
  url: string;
  state: {
    id: string;
    name: string;
  };
}

export interface ProjectWithUpdates {
  id: string;
  name: string;
  url: string;
  description?: string;
  health?: string;
  targetDate?: string;
  state: string;
  lead?: {
    id: string;
    displayName: string;
    email: string;
  };
  projectUpdates: {
    nodes: ProjectUpdate[];
  };
  issues: {
    nodes: ProjectIssue[];
  };
}
