# Configuration Guide

## API Key Setup

linear-for-ai requires a Linear API key. The key is loaded in this order:

1. `LINEAR_API_KEY` environment variable
2. `.env` file in current directory
3. macOS Keychain (macOS only)

If no key is found and you're running in an interactive terminal, you'll be prompted to set one up.

### Option 1: Environment Variable

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option 2: .env File

Create a `.env` file in your project root:

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** This only works when running linear-for-ai from that directory.

### Option 3: macOS Keychain (Recommended for macOS)

On first run without a configured key, you'll be prompted to store it in Keychain. This is the safest method.

To manually add via command line (without exposing the key in shell history):

```bash
# This prompts for the password securely (not saved to history)
security add-generic-password -s "linear-for-ai" -a "api-key" -w -U
```

The `-w` flag without a value will prompt you to enter the password interactively.

**Warning:** Do NOT pass the API key directly as an argument (e.g., `-w "lin_api_xxx"`) as it will be saved in your shell history file.

Benefits:
- Secure storage (encrypted by macOS)
- Works system-wide from any directory
- No plain text files to accidentally commit

## Other Environment Variables

```bash
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
