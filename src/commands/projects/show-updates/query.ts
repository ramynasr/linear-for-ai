/**
 * Query builder for show-my-updates command
 */

export interface BuildQueryOptions {
  sinceDate: string;
  limit: number;
  cursor?: string;
  showAllIssues: boolean;
}

export function buildQuery(options: BuildQueryOptions): string {
  const { sinceDate, limit, cursor, showAllIssues } = options;

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
  const issueFilter = showAllIssues ? `filter: { updatedAt: { gte: "${sinceDate}" } }` : `filter: {
        and: [
          { updatedAt: { gte: "${sinceDate}" } },
          { completedAt: { gte: "${sinceDate}" } }
        ]
      }`;

  // Build pagination parameters
  const paginationParams = cursor ? `first: ${limit}, after: "${cursor}"` : `first: ${limit}`;

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
