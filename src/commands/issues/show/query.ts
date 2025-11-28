import { buildFieldsString } from '../../../lib/utils/query.ts';

/**
 * Build GraphQL query for showing a single issue
 */
export function buildQuery(identifier: string, fields: string[]): string {
  return `
    query {
      issue(id: "${identifier}") {
        ${buildFieldsString(fields)}
      }
    }
  `;
}
