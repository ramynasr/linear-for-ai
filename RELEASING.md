# Releasing

How to publish a new version to GitHub and Homebrew.

## Prerequisites

**HOMEBREW_TAP_TOKEN**: GitHub personal access token with repo access to `ramynasr/homebrew-tap`. Set in repository secrets.

## Release Process

### 1. Update Version

Update version in `deno.json`:

```json
{
  "version": "0.2.0"
}
```

### 2. Create Git Tag

```bash
git tag v0.2.0
git push origin v0.2.0
```

### 3. Automated Steps

GitHub Actions automatically:

1. **Tests** - Runs tests, linter, type check
2. **Builds** - Compiles binaries for all platforms:
   - `linear-for-ai-macos-x64`
   - `linear-for-ai-macos-arm64`
   - `linear-for-ai-linux-x64`
   - `linear-for-ai-linux-arm64`
3. **Release** - Creates GitHub release with binaries
4. **Homebrew** - Updates formula in `ramynasr/homebrew-tap`:
   - Downloads binaries
   - Calculates SHA256 checksums
   - Updates `Formula/linear-for-ai.rb`
   - Commits and pushes changes

### 4. Verify

Check release succeeded:

```bash
# GitHub release
open https://github.com/ramynasr/linear-for-ai/releases

# Homebrew formula
open https://github.com/ramynasr/homebrew-tap/blob/main/Formula/linear-for-ai.rb

# Test installation
brew upgrade linear-for-ai
linear-for-ai --version
```

## Manual Homebrew Update

If automation fails, update manually:

```bash
# Clone tap repository
git clone https://github.com/ramynasr/homebrew-tap.git

# Run update script
./scripts/update-homebrew-formula.sh 0.2.0 ../homebrew-tap

# Review and push
cd ../homebrew-tap
git diff Formula/linear-for-ai.rb
git add Formula/linear-for-ai.rb
git commit -m "Update linear-for-ai to v0.2.0"
git push
```

## Rollback

Remove tag and delete release:

```bash
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0
gh release delete v0.2.0 --yes
```

Then revert Homebrew formula in tap repository.
