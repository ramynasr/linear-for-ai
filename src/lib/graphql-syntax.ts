/**
 * Convert a JavaScript object to GraphQL input syntax
 *
 * GraphQL syntax is similar to JSON but with unquoted keys:
 * - Keys are not quoted (unless they contain special characters)
 * - String values are quoted
 * - Numbers, booleans, and null are not quoted
 *
 * Example:
 *   Input:  { state: { eq: "in_progress" } }
 *   Output: {state: {eq: "in_progress"}}
 */
export function toGraphQLSyntax(obj: unknown): string {
  if (obj === null) {
    return 'null';
  }

  if (obj === undefined) {
    return 'null';
  }

  if (typeof obj === 'string') {
    // Escape quotes in strings and wrap in quotes
    return `"${obj.replace(/"/g, '\\"')}"`;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    const items = obj.map((item) => toGraphQLSyntax(item));
    return `[${items.join(', ')}]`;
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    const pairs = entries.map(([key, value]) => {
      return `${key}: ${toGraphQLSyntax(value)}`;
    });
    return `{${pairs.join(', ')}}`;
  }

  throw new Error(`Unsupported type: ${typeof obj}`);
}
