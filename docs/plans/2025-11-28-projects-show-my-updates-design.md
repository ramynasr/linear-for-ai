# Design: `projects show-my-updates` Command

**Date:** 2025-11-28
**Status:** Approved

## Overview

New command to help users track their contributions across projects they're members of (but not leading). Shows completed work, project updates, and activity from the last two weeks by default.

## Command Structure

```bash
linear-for-ai projects show-my-updates [options]
```

**Options:**

- `--since YYYY-MM-DD` - Show updates since specific date (default: 14 days ago)
- `--show-all-issue-updates` - Show all updated issues, not just completed ones
- `--limit N` - Max number of projects to show (default: 10)
- `--cursor STRING` - Pagination cursor for next page
- `--format FORMAT` - Output format: markdown (default) or json
- `--debug` - Show debug information

**Example usage:**

```bash
# Default: last 14 days, completed issues only, 10 projects max
linear-for-ai projects show-my-updates

# Custom date range
linear-for-ai projects show-my-updates --since 2025-01-15

# Show all issue activity, not just completed
linear-for-ai projects show-my-updates --show-all-issue-updates

# Show more projects
linear-for-ai projects show-my-updates --limit 25
```

## Filtering & Data Fetching Logic

### Step 1: Find qualifying projects

Query projects with filter:

```json
{
  "and": [
    {
      "members": {
        "some": {
          "isMe": { "eq": true }
        }
      }
    },
    {
      "lead": {
        "isMe": { "neq": true }
      }
    },
    {
      "updatedAt": {
        "gte": "<calculated-date>"
      }
    }
  ]
}
```

- Sort by `updatedAt` descending
- Apply pagination (limit + cursor)
- Default limit: 10 projects

### Step 2: For each project, fetch

1. **Project metadata:** name, url, description, health, targetDate, lead (name, email), state
2. **Project updates:** Filter by `createdAt >= <date>`, get all matching updates with author, body, createdAt, url
3. **Issues:**
   - Default: Filter by `updatedAt >= <date>` AND `completedAt >= <date>`
   - With `--show-all-issue-updates`: Filter only by `updatedAt >= <date>`
   - Limit to 20 most recently updated issues per project
   - Get identifier, title, state.name, url

### Step 3: Filter out empty projects

If a project has zero project updates AND zero matching issues, exclude it from output entirely.

## Output Format (Markdown)

### Overall structure

```markdown
# My Project Updates

Showing updates since <date> across <N> projects

---

## Project Name

<project-url>

**Lead:** <name> (<email>)
**Target Date:** <date> | **Health:** <health> | **State:** <state>

<description>

### Project Updates (<count>)

**<update-title-if-exists>** by <author-name> on <date>
<url>

<full-body-content-in-markdown>

---

**<next-update-title>** by <author> on <date>
<url>

<body>

---

### Recent Completed Issues (Showing X of Y)

- ENG-123: Fix authentication bug [Completed] <url>
- ENG-124: Add password reset flow [Done] <url>
- ENG-125: Update user profile page [Completed] <url>

---

## Next Project Name

...
```

### Formatting rules

- Use horizontal rules (`---`) to separate projects and project updates
- If no project updates exist, omit that section entirely
- If no issues exist, omit that section entirely
- Show "Showing X of Y issues" if there are more than 20 issues
- Use markdown formatting (bold, headers) but no ANSI colors

### JSON format

Standard JSON output with all fields included (for programmatic consumption).

## Implementation Structure

### File organization (Feature Slice)

```
src/
  commands/
    projects/
      show-my-updates/
        index.ts          # command handler
        query.ts          # query builder
        formatter.ts      # formatter
      show/
        index.ts
        query.ts
        formatter.ts
      list/
        index.ts
        query.ts
        formatter.ts
      types.ts            # project command-specific types
    issues/
      list/
        index.ts
        query.ts
        formatter.ts
      show/
        index.ts
        query.ts
        formatter.ts
      types.ts            # issue command-specific types
  lib/
    utils/
      query.ts            # shared query utilities
      formatter.ts        # shared formatter utilities
      command.ts          # shared command utilities
    graphql-client.ts
  types/
    linear.ts             # Linear API types
    cli.ts                # Shared CLI types
```

### Type organization principle

- `types/linear.ts` - API response types used across all commands
- `types/cli.ts` - Shared CLI interfaces (options, context)
- `commands/{resource}/types.ts` - Types specific to that resource's commands

### Key files for this command

1. **Command handler:** `src/commands/projects/show-my-updates/index.ts`
   ```typescript
   export async function showMyUpdates(
     client: GraphQLClient,
     context: CommandContext,
     options: ShowMyUpdatesOptions,
   ): Promise<string>;
   ```

2. **Query builder:** `src/commands/projects/show-my-updates/query.ts`
   ```typescript
   export function buildQuery(options: {
     sinceDate: string;
     limit: number;
     cursor?: string;
     showAllIssues: boolean;
   }): string;
   ```

3. **Formatter:** `src/commands/projects/show-my-updates/formatter.ts`
   ```typescript
   export function formatOutput(
     projects: LinearProject[],
     sinceDate: string,
     format: 'markdown' | 'json',
   ): string;
   ```

4. **Types:** `src/commands/projects/types.ts`
   ```typescript
   export interface ShowMyUpdatesOptions {
     since?: string;
     showAllIssueUpdates?: boolean;
     limit?: number;
     cursor?: string;
     format?: 'markdown' | 'json';
   }
   ```

## Error Handling & Edge Cases

### Input validation

1. **Invalid `--since` date format**
   - Validate YYYY-MM-DD format
   - Error: `Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-15)`

2. **Future date for `--since`**
   - Allow it (user might be testing or have use case)
   - If it returns no results, handle gracefully

3. **Invalid `--limit`**
   - Must be positive integer
   - Error: `Limit must be a positive integer`

### No results scenarios

1. **No projects found**
   ```
   No projects found where you're a member (but not lead) with activity since <date>.
   ```

2. **No activity in any projects**
   ```
   Found <N> projects but none have recent completed issues or project updates since <date>.

   Tip: Use --show-all-issue-updates to see in-progress work.
   ```

3. **Pagination exhausted**
   - Don't show error, just show results for current page
   - Omit cursor info if there's no next page

### Missing field handling

- **No description:** Show "(No description)"
- **No target date:** Show "Target Date: Not set"
- **No lead:** Show "Lead: Unassigned"
- **Null health:** Show "Health: Unknown"

### API errors

- **Authentication failure:** Propagate standard error with redacted key
- **Rate limiting:** Show retry-after if available
- **Network timeout:** Show helpful message about connectivity

## Testing Strategy

### Unit tests

1. **Query builder** (`query.ts`)
   - Test filter construction with different date ranges
   - Test with/without `--show-all-issue-updates` flag
   - Test pagination parameters
   - Verify nested query structure (projects → issues, projectUpdates)

2. **Formatter** (`formatter.ts`)
   - Test markdown output with complete data
   - Test with missing fields (no description, no lead, etc.)
   - Test with zero project updates
   - Test with zero issues
   - Test "showing X of Y" count display
   - Test JSON output format

3. **Command handler** (`index.ts`)
   - Mock GraphQL client
   - Test date calculation (14 days ago)
   - Test filter-out-empty-projects logic
   - Test pagination
   - Test error handling

### Integration tests

- Use recorded GraphQL responses (fixtures in `tests/fixtures/`)
- Test full command flow: CLI args → query → response → formatted output
- Test against different data scenarios (many projects, few issues, etc.)

### Test fixtures needed

- `project-with-updates-and-issues.json`
- `project-with-only-updates.json`
- `project-with-only-issues.json`
- `project-with-missing-fields.json`
- `empty-projects-response.json`

### What NOT to test

- Don't make real API calls in automated tests
- Don't commit fixtures with real workspace data

## Phase 0: Refactoring Existing Structure

**Goal:** Migrate current flat structure to feature-slice structure without breaking functionality.

### Scope of refactoring

Migrate these existing commands:

- `projects list`
- `projects show`
- `issues list`
- `issues show`
- `teams list` (if exists)
- `notifications list` (if exists)

### Migration steps

1. **Create new structure** (keep old files intact)
   ```bash
   mkdir -p src/commands/{projects,issues}/{list,show}
   mkdir -p src/lib/utils
   ```

2. **Extract shared utilities**
   - Move common query building logic to `lib/utils/query.ts`
   - Move common formatting logic to `lib/utils/formatter.ts`
   - Move common command logic to `lib/utils/command.ts`

3. **Migrate one command at a time**
   - Start with simplest: `issues list`
   - Split command handler → `commands/issues/list/index.ts`
   - Split query builder → `commands/issues/list/query.ts`
   - Split formatter → `commands/issues/list/formatter.ts`
   - Update imports in CLI router
   - Run tests to verify behavior unchanged

4. **Repeat for remaining commands**

5. **Create resource-level type files**
   - Extract command-specific types to `commands/projects/types.ts`
   - Extract command-specific types to `commands/issues/types.ts`

6. **Delete old files** once all commands migrated and tested

7. **Write structure documentation**
   - Create `docs/architecture/structure.md`
   - Explain file organization principles
   - Provide examples of where new code should go
   - Update `CLAUDE.md` to reference this doc

### Validation

- Run full test suite after each command migration
- Manually test each command with various options
- Verify `--debug` output still works
- Check that error messages are unchanged

### Git strategy

- Branch: `refactor/feature-slice-structure`
- One commit per command migrated (e.g., "Migrate issues list to feature slice")
- Final commit: "Remove old structure files and add documentation"
- Merge to trunk after all tests pass

### Definition of done

- ✅ All existing commands work identically
- ✅ All tests pass
- ✅ New structure documented in `docs/architecture/structure.md`
- ✅ `CLAUDE.md` updated with reference
- ✅ Old files deleted
- ✅ No regressions in functionality

## Implementation Phases

### Phase 0: Refactoring (separate branch)

1. Migrate existing commands to feature-slice structure
2. Extract shared utilities
3. Document structure decisions
4. Test everything
5. Merge to trunk

### Phase 1: Implement show-my-updates (new branch after Phase 0)

1. Create command structure
2. Build query logic
3. Build formatter
4. Wire up CLI routing
5. Write tests
6. Manual testing
7. Documentation updates

## Success Criteria

- Command produces expected output for various scenarios
- All tests pass
- Documentation is complete and referenced from CLAUDE.md
- No regressions in existing commands
- Code follows established patterns from refactored structure
