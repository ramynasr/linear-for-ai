import { buildFieldsString } from '../../../lib/utils/query.ts';

export function buildQuery(identifier: string, fields: string[]): string {
  // Calculate date 14 days ago for projects filter
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const dateFilter = twoWeeksAgo.toISOString();

  // Parse fields to handle nested fields
  const hasProjects = fields.some(f => f.startsWith('projects'));
  const hasSubInitiatives = fields.some(f => f.startsWith('subInitiatives'));
  const hasLastUpdate = fields.some(f => f.startsWith('lastUpdate'));
  const hasOwner = fields.some(f => f.startsWith('owner'));
  const hasCreator = fields.some(f => f.startsWith('creator'));

  // Build fields string with nested resource handling
  let fieldsString = '';
  const processedFields = fields.filter(f => {
    if (f.startsWith('projects') || f.startsWith('subInitiatives') ||
        f.startsWith('lastUpdate') || f.startsWith('owner.') || f.startsWith('creator.')) {
      return false;
    }
    return true;
  });

  fieldsString = buildFieldsString(processedFields);

  // Add nested resources based on fields
  if (hasOwner || fields.includes('owner')) {
    fieldsString += '\nowner { id displayName email }';
  }
  if (hasCreator || fields.includes('creator')) {
    fieldsString += '\ncreator { id displayName email }';
  }
  if (hasLastUpdate || fields.includes('lastUpdate')) {
    fieldsString += '\nlastUpdate { id body createdAt user { displayName } }';
  }
  if (hasProjects || fields.includes('projects')) {
    fieldsString += `
      projects(first: 50, filter: { updatedAt: { gte: "${dateFilter}" } }) {
        nodes {
          id
          name
          status
          url
          slugId
        }
      }
    `;
  }
  if (hasSubInitiatives || fields.includes('subInitiatives')) {
    fieldsString += `
      subInitiatives(first: 50) {
        nodes {
          id
          name
          status
          health
          slugId
        }
      }
    `;
  }

  return `
    query {
      initiative(id: "${identifier}") {
        ${fieldsString}
      }
    }
  `;
}
