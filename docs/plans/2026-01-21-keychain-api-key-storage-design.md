# macOS Keychain API Key Storage

## Overview

Add macOS Keychain as a secure fallback for storing the Linear API key, with interactive setup when no key is found.

## Motivation

- **Security:** Avoid storing API keys in plain text `.env` files that could be accidentally committed or read by other processes
- **Convenience:** Unified approach with existing Keychain usage for other secrets

## API Key Resolution Order

1. `LINEAR_API_KEY` environment variable
2. `.env` file in current directory
3. macOS Keychain (macOS only)

Existing setups continue working unchanged. Keychain is a fallback for users who prefer it.

## Keychain Details

**Storage identifiers:**
- Service: `linear-for-ai`
- Account: `api-key`

**Commands used:**
```bash
# Read
security find-generic-password -s "linear-for-ai" -a "api-key" -w

# Write (creates or updates)
security add-generic-password -s "linear-for-ai" -a "api-key" -w "<key>" -U
```

**Platform detection:**
- Check `Deno.build.os === "darwin"` before any Keychain operations
- Non-macOS systems skip Keychain entirely

## Interactive Setup Flow

**Triggers when:**
- No API key found in env var, .env, or Keychain
- stdin is a TTY (interactive terminal)

**Flow:**

1. Display: "No Linear API key found."

2. On macOS, prompt storage choice:
   ```
   Where would you like to store your API key?
   [1] macOS Keychain (recommended)
   [2] .env file in current directory
   ```

3. On non-macOS, prompt:
   ```
   Store API key in .env file? (y/n)
   ```

4. Display scope notice:
   - **Keychain:** "Your API key will be available system-wide for all directories."
   - **.env file:** "Note: This .env file only works when running linear-for-ai from this directory. For system-wide access, use Keychain (macOS) or add LINEAR_API_KEY to your shell profile (~/.zshrc)."

5. Prompt: "Enter your Linear API key:" (hidden input)

6. Validate format (warn if doesn't start with `lin_api_`, but don't block)

7. Store in chosen location

8. Display: "API key saved. Continuing..."

9. Proceed with original command

**Non-interactive environments (CI, piped input):**
- Skip setup, throw existing error: "LINEAR_API_KEY environment variable is required"

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `.env` write fails (permissions) | Show error, suggest Keychain or manual setup |
| Keychain write fails | Show error, suggest .env or manual setup |
| Keychain read returns exit 44 | Treat as "not configured" |
| Keychain read returns other error | Log debug warning, treat as "not available" |

## Code Changes

| File | Change |
|------|--------|
| `src/lib/keychain.ts` | New — Keychain read/write via `security` CLI |
| `src/lib/setup.ts` | New — Interactive setup flow |
| `src/lib/env.ts` | Modified — Add Keychain fallback + setup trigger |
| `docs/configuration.md` | Update — Document Keychain option |

### New: `src/lib/keychain.ts`

```typescript
isKeychainAvailable(): boolean
// Returns true if Deno.build.os === "darwin"

readFromKeychain(): Promise<string | null>
// Runs security find-generic-password, returns key or null

writeToKeychain(apiKey: string): Promise<void>
// Runs security add-generic-password -U
```

### New: `src/lib/setup.ts`

```typescript
runInteractiveSetup(): Promise<string>
// Handles interactive prompts, returns stored API key

writeToEnvFile(apiKey: string): Promise<void>
// Creates or updates .env file with LINEAR_API_KEY

isInteractive(): boolean
// Returns true if stdin is TTY
```

### Modified: `src/lib/env.ts`

Update `loadEnvironment()` to:
1. Check env var / .env (existing behavior)
2. If not found and Keychain available, try `readFromKeychain()`
3. If still not found and interactive TTY, call `runInteractiveSetup()`
4. If still not found, throw existing error

## Out of Scope

- Multiple API keys / workspace switching
- `config clear-api-key` command
- Cross-platform keyring support (Linux, Windows)
- Validating API key against Linear API during setup

## Testing

- Unit tests with mocked `Deno.Command` for Keychain operations
- Tests for each storage path (env var, .env, Keychain)
- Tests for interactive setup flow
- Tests for error conditions and non-interactive environments
