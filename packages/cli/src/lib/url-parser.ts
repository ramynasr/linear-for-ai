/**
 * Utility functions for parsing Linear URLs and extracting identifiers
 */

export interface ParsedLinearUrl {
  type: 'project' | 'issue' | 'cycle' | 'team' | 'unknown';
  slugId?: string;
  identifier?: string;
}

/**
 * Parse a Linear URL and extract the slugId or identifier
 *
 * Examples:
 * - https://linear.app/a8c/project/project-name-1bf214adf52f -> { type: 'project', slugId: '1bf214adf52f' }
 * - https://linear.app/a8c/issue/ENG-123/title -> { type: 'issue', identifier: 'ENG-123' }
 * - https://linear.app/cycle/uuid -> { type: 'cycle', identifier: 'uuid' }
 */
export function parseLinearUrl(urlOrId: string): ParsedLinearUrl | null {
  // If it doesn't look like a URL, return null
  if (!urlOrId.includes('/') && !urlOrId.startsWith('http')) {
    return null;
  }

  try {
    const url = new URL(urlOrId);

    // Check if it's a Linear URL
    if (!url.hostname.includes('linear.app')) {
      return null;
    }

    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length < 1) {
      return null;
    }

    // Detect type from path
    // For URLs like /cycle/uuid or /team/KEY, type is pathParts[0]
    // For URLs like /workspace/project/name or /workspace/issue/ID, type is pathParts[1]
    const potentialType = pathParts[0];

    // Check if it's a direct resource type (cycle, team)
    if (potentialType === 'cycle' || potentialType === 'team') {
      const type = potentialType as ParsedLinearUrl['type'];
      if (pathParts.length >= 2) {
        const identifier = pathParts[1];
        return { type, identifier };
      }
      return { type };
    }

    // Otherwise, it's a workspace-based URL (/workspace/project/... or /workspace/issue/...)
    if (pathParts.length < 2) {
      return null;
    }

    const type = pathParts[1] as ParsedLinearUrl['type'];

    switch (type) {
      case 'project': {
        // Project URLs: /workspace/project/name-slugId
        // Extract slugId from the last part after the last hyphen
        if (pathParts.length >= 3) {
          const projectPart = pathParts[2];
          const lastHyphenIndex = projectPart.lastIndexOf('-');
          if (lastHyphenIndex > 0) {
            const slugId = projectPart.substring(lastHyphenIndex + 1);
            return { type: 'project', slugId };
          }
        }
        return { type: 'project' };
      }

      case 'issue': {
        // Issue URLs: /workspace/issue/TEAM-123/title
        if (pathParts.length >= 3) {
          const identifier = pathParts[2];
          return { type: 'issue', identifier };
        }
        return { type: 'issue' };
      }

      default:
        return { type: 'unknown' };
    }
  } catch (error) {
    // Not a valid URL
    return null;
  }
}

/**
 * Check if a string is a Linear URL
 */
export function isLinearUrl(urlOrId: string): boolean {
  return parseLinearUrl(urlOrId) !== null;
}

/**
 * Extract project slugId from a URL or return the original ID
 */
export function extractProjectIdentifier(urlOrId: string): { type: 'slugId' | 'id', value: string } {
  const parsed = parseLinearUrl(urlOrId);

  if (parsed?.type === 'project' && parsed.slugId) {
    return { type: 'slugId', value: parsed.slugId };
  }

  // Assume it's a UUID if it's not a URL
  return { type: 'id', value: urlOrId };
}

/**
 * Extract issue identifier from a URL or return the original identifier
 * Works with both URLs (https://linear.app/a8c/issue/ENG-123/title) and identifiers (ENG-123)
 */
export function extractIssueIdentifier(urlOrId: string): string {
  const parsed = parseLinearUrl(urlOrId);

  if (parsed?.type === 'issue' && parsed.identifier) {
    return parsed.identifier;
  }

  // Return as-is (could be ENG-123 or a UUID)
  return urlOrId;
}

/**
 * Extract cycle identifier from a URL or return the original ID
 */
export function extractCycleIdentifier(urlOrId: string): string {
  const parsed = parseLinearUrl(urlOrId);

  if (parsed?.type === 'cycle' && parsed.identifier) {
    return parsed.identifier;
  }

  // Return as-is (UUID)
  return urlOrId;
}
