# Configuration Guide

## Environment Variables

Create a `.env` file in your project root or set environment variables:

```bash
# Required
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
LINEAR_CONFIG=/custom/path/to/config.json
HTTPS_PROXY=http://proxy.example.com:8080
HTTP_PROXY=http://proxy.example.com:8080
```

## Configuration File

Default location: `~/.config/linear-for-ai/config.json`

See `config.example.json` for full example.

### Key Settings

**allowWrites** (boolean, default: false)

- Must be `true` to execute write operations with `--allow-writes` flag

**defaults.format** (string, default: "markdown")

- Default output format: "markdown" or "json"

**defaults.limit** (number, default: 50)

- Default pagination limit for list commands

**defaults.fields** (object)

- Default field selections for each resource type
- Use dot notation for nested fields: "assignee.displayName"

## Field Selection

Override defaults with `--fields` flag:

```bash
linear-for-ai issues list --fields id,title,url
linear-for-ai issues show ENG-123 --fields id,title,description,state.name
```

## Proxy Configuration

Two ways to configure proxy:

1. Environment variables (applies to all requests):

```bash
export HTTPS_PROXY=http://proxy.example.com:8080
```

2. Config file (takes precedence):

```json
{
  "proxy": {
    "enabled": true,
    "url": "http://proxy.example.com:8080"
  }
}
```
