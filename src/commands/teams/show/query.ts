import { buildFieldSelection } from '../../../lib/utils/query.ts';

export function buildQuery(id: string, fields: string[]): string {
  return `
    query {
      team(id: "${id}") {
        ${buildFieldSelection(fields)}
      }
    }
  `;
}
