/**
 * Query builder for show-updates command
 */

export interface BuildQueryOptions {
  sinceDate: string;
  limit: number;
  cursor?: string;
  showAllIssues: boolean;
  idOrUrl?: string;
}

/**
 * Builds GraphQL query for show-updates command
 *
 * Two modes:
 * 1. Single project mode (idOrUrl provided): Uses project(id:) query with nested fields
 * 2. All projects mode (no idOrUrl): Uses projectUpdates + projects queries with filters
 *
 * Pagination behavior:
 * - Single project: limit/cursor are NOT used for projectUpdates (fetches all 250, filters client-side)
 * - All projects: limit/cursor control the projects query pagination
 *
 * Note: projectUpdates nested field doesn't support filter parameters, only orderBy and pagination.
 * Date filtering for single project mode happens client-side in the handler.
 */
export function buildQuery(options: BuildQueryOptions): string {
  const { sinceDate, limit, cursor, showAllIssues, idOrUrl } = options;

  if (idOrUrl) {
    // Single project mode
    return buildSingleProjectQuery(idOrUrl, sinceDate, showAllIssues);
  } else {
    // All projects mode
    return buildAllProjectsQuery(sinceDate, limit, cursor, showAllIssues);
  }
}

/**
 * Builds query for single project mode
 *
 * Uses project(id:) with nested projectUpdates. The projectUpdates field
 * doesn't support filter parameters (only orderBy and pagination), so we
 * fetch up to 250 updates and filter by date client-side in the handler.
 *
 * The project(id:) query accepts UUID, slug, or URL formats natively.
 */
function buildSingleProjectQuery(
  idOrUrl: string,
  sinceDate: string,
  showAllIssues: boolean,
): string {
  // Build issue filter based on showAllIssues flag
  const issueFilter = showAllIssues
    ? `filter: { updatedAt: { gte: "${sinceDate}" } }`
    : `filter: {
        and: [
          { updatedAt: { gte: "${sinceDate}" } },
          { completedAt: { gte: "${sinceDate}" } }
        ]
      }`;

  return `
    query {
      project(id: "${idOrUrl}") {
        id
        name
        url
        description
        health
        targetDate
        state
        lead {
          id
          displayName
          email
        }
        projectUpdates(
          first: 250,
          orderBy: createdAt
        ) {
          nodes {
            id
            body
            createdAt
            url
            user {
              id
              displayName
            }
          }
        }
        issues(
          ${issueFilter},
          orderBy: updatedAt,
          first: 20
        ) {
          nodes {
            id
            identifier
            title
            url
            state {
              id
              name
            }
          }
        }
      }
    }
  `;
}

function buildAllProjectsQuery(
  sinceDate: string,
  limit: number,
  cursor: string | undefined,
  showAllIssues: boolean,
): string {
  // Build project filter: member but not lead
  const projectFilter = `{
    and: [
      {
        members: {
          some: {
            isMe: { eq: true }
          }
        }
      },
      {
        lead: {
          isMe: { neq: true }
        }
      },
      {
        updatedAt: {
          gte: "${sinceDate}"
        }
      }
    ]
  }`;

  // Build project updates filter: date + project membership
  const projectUpdatesFilter = `{
    and: [
      {
        createdAt: {
          gte: "${sinceDate}"
        }
      },
      {
        project: {
          and: [
            {
              members: {
                some: {
                  isMe: { eq: true }
                }
              }
            },
            {
              lead: {
                isMe: { neq: true }
              }
            }
          ]
        }
      }
    ]
  }`;

  // Build issue filter based on showAllIssues flag
  const issueFilter = showAllIssues
    ? `filter: { updatedAt: { gte: "${sinceDate}" } }`
    : `filter: {
        and: [
          { updatedAt: { gte: "${sinceDate}" } },
          { completedAt: { gte: "${sinceDate}" } }
        ]
      }`;

  // Build pagination parameters
  const paginationParams = cursor
    ? `first: ${limit}, after: "${cursor}"`
    : `first: ${limit}`;

  return `
    query {
      projectUpdates(
        filter: ${projectUpdatesFilter},
        orderBy: createdAt,
        first: 250
      ) {
        nodes {
          id
          body
          createdAt
          url
          user {
            id
            displayName
          }
          project {
            id
            name
            url
            description
            health
            targetDate
            state
            lead {
              id
              displayName
              email
            }
          }
        }
      }
      projects(
        filter: ${projectFilter},
        orderBy: updatedAt,
        ${paginationParams}
      ) {
        nodes {
          id
          name
          url
          description
          health
          targetDate
          state
          lead {
            id
            displayName
            email
          }
          issues(
            ${issueFilter},
            orderBy: updatedAt,
            first: 20
          ) {
            nodes {
              id
              identifier
              title
              url
              state {
                id
                name
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}
