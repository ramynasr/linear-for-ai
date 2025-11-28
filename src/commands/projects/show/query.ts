import { buildFieldsString } from '../../../lib/utils/query.ts';

export function buildQuery(id: string, fields: string[]): string {
  return `
    query {
      project(id: "${id}") {
        ${buildFieldsString(fields)}
      }
    }
  `;
}
