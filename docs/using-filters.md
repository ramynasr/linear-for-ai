# Using Filters

Filters allow you to narrow down results when listing resources. This guide covers how to use filters effectively with `linear-for-ai`.

## Basic Usage

Filters are passed as JSON strings via the `--filter` flag:

```bash
linear-for-ai issues list --filter '{"state":{"type":{"eq":"started"}}}'
```

## How Filters Work

1. **JSON Input**: You provide a filter as a JSON string
2. **Parsing**: The CLI parses the JSON into a JavaScript object
3. **GraphQL Conversion**: The object is converted to GraphQL input syntax
4. **API Request**: The filter is sent to Linear's GraphQL API

## Filter Structure

Linear uses a nested filter structure with **comparators**:

```json
{
  "fieldName": {
    "comparator": "value"
  }
}
```

For object fields (like `state`, `assignee`, `project`), you must specify which nested field to filter on:

```json
{
  "objectField": {
    "nestedField": {
      "comparator": "value"
    }
  }
}
```

## Common Comparators

### StringComparator

- `eq` - Equals exactly
- `neq` - Not equals
- `in` - In array of values
- `contains` - Contains substring
- `containsIgnoreCase` - Contains substring (case-insensitive)
- `startsWith` - Starts with string
- `endsWith` - Ends with string
- `eqIgnoreCase` - Equals (case-insensitive)

### NumberComparator

- `eq` - Equals
- `neq` - Not equals
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `in` - In array of values

### DateComparator

- `eq` - Equals date
- `neq` - Not equals date
- `gt` - After date
- `gte` - On or after date
- `lt` - Before date
- `lte` - On or before date

### BooleanComparator

- `eq` - Equals (true or false)
- `neq` - Not equals

## Common Pitfalls

### ❌ Incorrect: Filtering object fields directly

```bash
# WRONG - state is an object, not a string
--filter '{"state":{"eq":"In Progress"}}'
```

### ✅ Correct: Specify the nested field

```bash
# RIGHT - filter by state.name or state.type
--filter '{"state":{"name":{"eq":"In Progress"}}}'
--filter '{"state":{"type":{"eq":"started"}}}'
```

### ❌ Incorrect: Using JSON syntax in GraphQL

The CLI handles this automatically, but be aware that GraphQL uses unquoted keys:

- JSON: `{"key": "value"}`
- GraphQL: `{key: "value"}`

You provide JSON; the CLI converts it to GraphQL.

## Examples by Resource

### Issues

**Filter by state type:**

```bash
linear-for-ai issues list --filter '{"state":{"type":{"eq":"started"}}}'
```

State types: `triage`, `backlog`, `unstarted`, `started`, `completed`, `canceled`

**Filter by state name:**

```bash
linear-for-ai issues list --filter '{"state":{"name":{"eq":"In Progress"}}}'
```

**Filter by assignee:**

```bash
linear-for-ai issues list --filter '{"assignee":{"name":{"eq":"John Doe"}}}'
```

**Filter by priority:**

```bash
linear-for-ai issues list --filter '{"priority":{"eq":1}}'
```

Priority values: `0` = None, `1` = Urgent, `2` = High, `3` = Normal, `4` = Low

**Filter by team:**

```bash
linear-for-ai issues list --filter '{"team":{"key":{"eq":"ENG"}}}'
```

**Multiple conditions (AND):**

```bash
linear-for-ai issues list --filter '{"and":[{"state":{"type":{"eq":"started"}}},{"priority":{"lte":2}}]}'
```

**Multiple conditions (OR):**

```bash
linear-for-ai issues list --filter '{"or":[{"state":{"type":{"eq":"started"}}},{"state":{"type":{"eq":"completed"}}}]}'
```

**Using IN operator:**

```bash
linear-for-ai issues list --filter '{"state":{"type":{"in":["started","completed"]}}}'
```

### Projects

**Filter projects where I'm a member:**

```bash
linear-for-ai projects list --filter '{"members":{"some":{"isMe":{"eq":true}}}}'
```

**Filter by project state:**

```bash
linear-for-ai projects list --filter '{"state":{"eq":"started"}}'
```

Project states: `planned`, `started`, `paused`, `completed`, `canceled`

**Filter by lead:**

```bash
linear-for-ai projects list --filter '{"lead":{"name":{"eq":"Jane Smith"}}}'
```

**Filter by name containing text:**

```bash
linear-for-ai projects list --filter '{"name":{"contains":"Q1"}}'
```

### Teams

**Filter by team key:**

```bash
linear-for-ai teams list --filter '{"key":{"eq":"ENG"}}'
```

**Filter by name:**

```bash
linear-for-ai teams list --filter '{"name":{"contains":"Engineering"}}'
```

## Collection Filters

When filtering by relationships (e.g., "projects where I'm a member"), use collection filters:

- `some` - At least one item matches
- `every` - All items match
- `length` - Collection has specific length

**Example: Projects with at least one member named "John"**

```bash
linear-for-ai projects list --filter '{"members":{"some":{"name":{"eq":"John"}}}}'
```

**Example: Projects with exactly 3 members**

```bash
linear-for-ai projects list --filter '{"members":{"length":{"eq":3}}}'
```

## Current User Filters

Use `isMe` to filter by the authenticated user:

**Issues assigned to me:**

```bash
linear-for-ai issues list --filter '{"assignee":{"isMe":{"eq":true}}}'
```

**Projects where I'm a member:**

```bash
linear-for-ai projects list --filter '{"members":{"some":{"isMe":{"eq":true}}}}'
```

## Debugging Filters

If you get errors:

1. **Check field nesting**: Object fields need nested field specification
2. **Verify comparator**: Use `eq` not `equals`, `gt` not `greaterThan`
3. **Check values**: State types use lowercase (`started` not `Started`)
4. **Validate JSON**: Ensure your JSON is valid before passing to `--filter`
5. **Use `--debug`**: See the actual GraphQL query being sent

## Reference

For the complete list of available filters and fields, refer to:

- Linear API Documentation: https://developers.linear.app/docs/graphql/working-with-the-graphql-api
- GraphQL Schema: `./docs/linear-docs/schema.graphql`

Look for `*Filter` input types in the schema (e.g., `IssueFilter`, `ProjectFilter`, `WorkflowStateFilter`).
