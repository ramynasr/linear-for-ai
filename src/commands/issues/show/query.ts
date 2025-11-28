import { buildFieldSelection } from '../../../lib/utils/query.ts';

/**
 * Build GraphQL query for showing a single issue
 */
export function buildQuery(identifier: string, fields: string[]): string {
  return `
    query {
      issue(id: "${identifier}") {
        ${buildFieldSelection(fields)}
      }
    }
  `;
}
