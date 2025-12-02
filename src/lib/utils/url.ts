/**
 * Extract identifier from Linear URLs or return the input as-is
 */

/**
 * Extract initiative identifier (slugId) from Linear URL or return input as-is
 * @param input - Can be a Linear URL, slugId, or UUID
 * @returns The extracted slugId or the original input
 *
 * Examples:
 * - https://linear.app/workspace/initiative/INI-123 -> INI-123
 * - INI-123 -> INI-123
 * - abc-123-def-456 -> abc-123-def-456
 */
export function extractInitiativeIdentifier(input: string): string {
  // URL format: https://linear.app/<workspace>/initiative/<slugId>
  const urlMatch = input.match(/\/initiative\/([A-Z]+-\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  return input;
}

/**
 * Extract issue identifier from Linear URL or return input as-is
 * @param input - Can be a Linear URL, issue key, or UUID
 * @returns The extracted issue key or the original input
 */
export function extractIssueIdentifier(input: string): string {
  // URL format: https://linear.app/<workspace>/issue/<issueKey>
  const urlMatch = input.match(/\/issue\/([A-Z]+-\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  return input;
}

/**
 * Extract project identifier from Linear URL or return input as-is
 * @param input - Can be a Linear URL, project key, or UUID
 * @returns The extracted project key or the original input
 */
export function extractProjectIdentifier(input: string): string {
  // URL format: https://linear.app/<workspace>/project/<projectKey>
  const urlMatch = input.match(/\/project\/([A-Z]+-\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  return input;
}
