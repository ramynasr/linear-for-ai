/**
 * Filter utilities for building "my resources" filters
 */

export type FilterObject = Record<string, unknown>;

/**
 * Build a filter to show only resources related to the authenticated user
 */
export function buildMyResourcesFilter(
  resource: 'issues' | 'projects',
): FilterObject {
  switch (resource) {
    case 'issues':
      return {
        or: [
          { assignee: { isMe: { eq: true } } },
          { creator: { isMe: { eq: true } } },
          { subscribers: { some: { isMe: { eq: true } } } },
        ],
      };

    case 'projects':
      return {
        or: [
          { lead: { isMe: { eq: true } } },
          { creator: { isMe: { eq: true } } },
          { members: { some: { isMe: { eq: true } } } },
        ],
      };

    default:
      throw new Error(`Unknown resource type: ${resource}`);
  }
}

/**
 * Merge the default "my resources" filter with a user-provided filter
 */
export function mergeFilters(
  defaultFilter: FilterObject,
  userFilter?: FilterObject,
): FilterObject {
  if (!userFilter || Object.keys(userFilter).length === 0) {
    return defaultFilter;
  }

  return {
    and: [defaultFilter, userFilter],
  };
}
