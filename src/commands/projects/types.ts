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
