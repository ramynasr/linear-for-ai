# Fields Guide

This guide covers how to use the `--fields` option to customize output from `linear-for-ai` commands.

## Overview

By default, commands auto-detect which fields to display based on the data returned. Use `--fields` to request specific fields, including nested object properties using dot notation.

**Basic usage:**
```bash
linear-for-ai projects list --fields "id,name,status.name"
linear-for-ai issues list --fields "identifier,title,team.key,assignee.name"
```

## Dot Notation

Access nested object properties using dot notation:

```bash
# Access nested properties
--fields "status.name"           # Project status name
--fields "assignee.email"        # Assignee's email
--fields "team.key"              # Team identifier

# Combine simple and nested fields
--fields "id,name,status.name,lead.email"
```

## Available Fields

### Projects

**Simple fields:**
- `id` - Unique identifier
- `name` - Project name
- `slugId` - URL-friendly slug
- `state` - State string (deprecated, use status.name)
- `progress` - Completion percentage (0-100)
- `priority` - Numeric priority (0-4)
- `priorityLabel` - Priority as text (Urgent, High, Medium, Low, None)
- `health` - Project health (onTrack, atRisk, offTrack)
- `scope` - Total estimate points
- `color` - Project color (HEX)
- `icon` - Project icon
- `startDate` - Planned start date
- `targetDate` - Target completion date
- `startedAt` - When moved to started state
- `completedAt` - When moved to completed state
- `canceledAt` - When moved to canceled state
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `archivedAt` - Archive timestamp
- `trashed` - Boolean trash status
- `url` - Web URL

**Nested fields (status):**
- `status.name` - Status name (e.g., "In Progress", "Backlog")
- `status.type` - Status type (e.g., "started", "backlog", "planned")
- `status.color` - Status color (HEX)
- `status.description` - Status description

**Nested fields (lead):**
- `lead.displayName` - Lead's display name
- `lead.name` - Lead's full name
- `lead.email` - Lead's email

**Nested fields (creator):**
- `creator.displayName` - Creator's display name
- `creator.name` - Creator's full name
- `creator.email` - Creator's email

**Examples:**
```bash
# Basic project info
linear-for-ai projects list --fields "name,status.name,progress"

# Project with lead details
linear-for-ai projects list --fields "name,status.name,lead.name,lead.email"

# Project health and priorities
linear-for-ai projects list --fields "name,health,priorityLabel,targetDate"
```

### Issues

**Simple fields:**
- `id` - Unique identifier
- `identifier` - Human-readable ID (e.g., ENG-123)
- `number` - Issue number
- `title` - Issue title
- `description` - Issue description
- `priority` - Numeric priority (0-4)
- `priorityLabel` - Priority as text (Urgent, High, Medium, Low, None)
- `estimate` - Complexity estimate
- `dueDate` - Due date
- `branchName` - Suggested git branch name
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `startedAt` - When moved to started state
- `completedAt` - When moved to completed state
- `canceledAt` - When moved to canceled state
- `archivedAt` - Archive timestamp
- `snoozedUntilAt` - Snooze until timestamp
- `trashed` - Boolean trash status
- `url` - Web URL

**Nested fields (state):**
- `state.name` - Status name (e.g., "In Progress", "Todo")
- `state.color` - Status color (HEX)
- `state.description` - Status description
- `state.type` - Status type

**Nested fields (assignee):**
- `assignee.displayName` - Assignee's display name
- `assignee.name` - Assignee's full name
- `assignee.email` - Assignee's email

**Nested fields (creator):**
- `creator.displayName` - Creator's display name
- `creator.name` - Creator's full name
- `creator.email` - Creator's email

**Nested fields (team):**
- `team.key` - Team identifier (e.g., "ENG", "DESIGN")
- `team.name` - Team name
- `team.displayName` - Full team name including parent
- `team.color` - Team color (HEX)

**Nested fields (project):**
- `project.name` - Project name
- `project.slugId` - Project slug

**Nested fields (cycle):**
- `cycle.number` - Cycle number
- `cycle.name` - Cycle name

**Nested fields (parent):**
- `parent.identifier` - Parent issue identifier
- `parent.title` - Parent issue title

**Examples:**
```bash
# Basic issue info
linear-for-ai issues list --fields "identifier,title,state.name,priority"

# Issue with team and assignee
linear-for-ai issues list --fields "identifier,title,team.key,assignee.name"

# Issue with project and cycle
linear-for-ai issues list --fields "identifier,title,project.name,cycle.number"

# Issue with parent relationship
linear-for-ai issues list --fields "identifier,title,parent.identifier,parent.title"
```

## Field Selection Behavior

**Without `--fields`:**
- Commands auto-detect fields from the returned data
- All non-null fields in the response are displayed

**With `--fields`:**
- Only specified fields are displayed
- Fields are shown in the order specified
- Non-existent fields show as "N/A"

**Column headers:**
- Simple fields use human-readable titles from field definitions
- Nested fields use the child property's title
- Unknown fields use the field name as-is

## Output Formats

Field selection works with both output formats:

**Markdown (default):**
```bash
linear-for-ai projects list --fields "name,status.name,lead.name"
```
Output:
```
## Projects (5 results)

Name                  Status       Lead Name
--------------------  -----------  ---------------
Project Alpha         In Progress  Alice Smith
Project Beta          Backlog      Bob Jones
```

**JSON:**
```bash
linear-for-ai projects list --fields "name,status.name" --format json
```
Output shows full objects (field selection doesn't filter JSON output).

## Tips

**Combine related fields:**
```bash
# Get complete assignee info
--fields "identifier,title,assignee.name,assignee.email"

# Track project progress
--fields "name,status.name,progress,health"
```

**Keep it concise:**
- Limit fields for readability in terminal output
- Use JSON format for programmatic processing with all fields

**Discover available fields:**
- Run commands without `--fields` to see what's available
- Check the GraphQL schema in `./docs/linear-docs/schema.graphql`

## Common Use Cases

**Track project status:**
```bash
linear-for-ai projects list --fields "name,status.name,health,progress,lead.name"
```

**Issue triage:**
```bash
linear-for-ai issues list --fields "identifier,title,state.name,priority,assignee.name"
```

**Team workload:**
```bash
linear-for-ai issues list --fields "identifier,title,team.key,assignee.name,estimate"
```

**Sprint planning:**
```bash
linear-for-ai issues list --fields "identifier,title,cycle.number,estimate,state.name"
```

**Dependency tracking:**
```bash
linear-for-ai issues list --fields "identifier,title,parent.identifier,project.name"
```
