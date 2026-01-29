# Version Update Procedures - SmartWrite Publisher

**Last Updated**: January 29, 2026
**Current Version**: 0.1.7
**Next Expected Version**: 0.1.8 or 0.2.0

---

## Quick Reference

### Semantic Versioning Strategy

| Level | Format | When to Use | Example |
|-------|--------|------------|---------|
| **Patch** | `0.0.X` | Bug fixes, minor adjustments | `0.1.7` → `0.1.8` |
| **Minor** | `0.X.0` | New feature complete | `0.1.8` → `0.2.0` |
| **Major** | `X.0.0` | Breaking changes | `0.9.0` → `1.0.0` |

---

## Step-by-Step Version Update Process

### Phase 1: Pre-Update Verification

```bash
# 1. Verify current version in manifest.json
cat smartwrite_publisher/manifest.json | grep version

# 2. Verify version in package.json
cat smartwrite_publisher/package.json | grep version

# 3. Check if versions match
# Both should currently show: "version": "0.1.7"
```

### Phase 2: Update Version Numbers

#### Option A: Patch Update (0.1.7 → 0.1.8)

**When to use**: Bug fixes, security patches, minor adjustments

```bash
cd smartwrite_publisher

# 1. Update package.json version
# Change: "version": "0.1.7"
# To:     "version": "0.1.8"
nano package.json

# 2. Update manifest.json version
# Change: "version": "0.1.7"
# To:     "version": "0.1.8"
nano manifest.json

# 3. Add CHANGELOG entry
nano CHANGELOG.md
```

**CHANGELOG.md format for patch**:
```markdown
## [0.1.8] - 2026-01-29

### Fixed
- Fixed ESLint violations and type safety issues
- Fixed command ID naming convention
- Improved sentence case consistency

### Changed
- Updated button UI for better accessibility
```

#### Option B: Minor Update (0.1.8 → 0.2.0)

**When to use**: New complete feature (Phase 2 features)

```bash
cd smartwrite_publisher

# 1. Update package.json version
# Change: "version": "0.1.8"
# To:     "version": "0.2.0"
nano package.json

# 2. Update manifest.json version
# Change: "version": "0.1.8"
# To:     "version": "0.2.0"
nano manifest.json

# 3. Add CHANGELOG entry
nano CHANGELOG.md
```

**CHANGELOG.md format for minor**:
```markdown
## [0.2.0] - 2026-02-XX

### Added
- Metadata parser for note analysis
- Markdown to HTML converter
- Single post publishing to Substack
- Hashtag auto-generation

### Changed
- Enhanced UI for batch publishing
- Improved error messages

### Fixed
- Memory management optimizations
```

#### Option C: Major Update (0.9.0 → 1.0.0)

**When to use**: Breaking changes or production-ready release

```bash
cd smartwrite_publisher

# 1. Update package.json version
# Change: "version": "0.X.X"
# To:     "version": "1.0.0"
nano package.json

# 2. Update manifest.json version
# Change: "version": "0.X.X"
# To:     "version": "1.0.0"
nano manifest.json

# 3. Add CHANGELOG entry with migration guide
nano CHANGELOG.md
```

---

## Phase 3: Automatic Version Synchronization

SmartWrite Publisher includes an automatic version bump script. After updating versions manually:

```bash
cd smartwrite_publisher

# This runs automatically as part of npm version or npm run version
npm run version

# This will:
# 1. Read version from package.json
# 2. Update manifest.json to match
# 3. Update versions.json with minAppVersion mapping
```

**What `npm run version` does**:
- Syncs `package.json` version → `manifest.json`
- Updates `versions.json` with new version mapping
- Ensures all version files stay synchronized

---

## Phase 4: Build and Test

### Build the Plugin

```bash
cd smartwrite_publisher

# Clean build (production mode)
npm run build

# Output:
# - main.js (bundled code)
# - manifest.json (copied)
# - styles.css (copied)
# Deployed to: .obsidian/plugins/smartwrite-publisher/
```

### Test in Development Vault

```bash
# 1. Reload Obsidian plugin
#    In Obsidian: Settings → Community Plugins → SmartWrite Publisher → Reload

# 2. Verify version in Obsidian
#    Community Plugins → SmartWrite Publisher → Shows updated version

# 3. Test all features:
#    - Sidebar opens correctly
#    - Settings tab loads
#    - Connection test works
#    - No console errors
#    - Logs display properly
```

---

## Phase 5: Commit and Tag

### Create Commit

```bash
cd smartwrite_publisher

# Stage all changes
git add package.json manifest.json versions.json CHANGELOG.md

# Commit with semantic message
git commit -m "[Feat]: Implement Phase 2 features - v0.2.0"

# Or for patch:
git commit -m "[Fix]: Correct ESLint violations - v0.1.8"

# Or for major:
git commit -m "[Release]: Production-ready version - v1.0.0"

# View commit
git log --oneline -1
```

**Commit message format**:
```
[Type]: Description - vX.Y.Z

- Detailed bullet points of changes
- Each change on separate line
- Reference related issues if any

Commit for: SmartWrite Publisher
```

### Create Git Tag

```bash
# Create annotated tag
git tag -a 0.2.0 -m "SmartWrite Publisher v0.2.0 - Phase 2 Features"

# Push tag to GitHub
git push origin 0.2.0

# Or push all tags at once
git push origin --tags

# Verify tag created
git tag -l
```

---

## Phase 6: GitHub Release (For Public Submission)

### Create GitHub Release

```bash
# Build final production version
npm run build

# Go to GitHub repository
# https://github.com/zandercpzed/smartwrite-publisher

# Create Release:
# 1. Click "Releases" tab
# 2. Click "Create a new release"
# 3. Choose tag: v0.2.0
# 4. Title: "SmartWrite Publisher v0.2.0"
# 5. Description: Copy from CHANGELOG.md
# 6. Upload artifacts:
#    - main.js
#    - manifest.json
#    - styles.css
# 7. Click "Publish release"
```

---

## Version Files Reference

### Current Version Status (v0.1.7)

#### `smartwrite_publisher/package.json`
```json
{
  "name": "smartwrite-publisher",
  "version": "0.1.7",
  "description": "Automatizador de publicações para Substack diretamente do Obsidian.",
  ...
}
```

#### `smartwrite_publisher/manifest.json`
```json
{
  "id": "smartwrite-publisher",
  "name": "SmartWrite Publisher",
  "version": "0.1.7",
  "minAppVersion": "0.15.0",
  "description": "Automatizador de publicações para Substack diretamente do Obsidian.",
  ...
}
```

#### `smartwrite_publisher/versions.json`
```json
{
  "1.0.0": "0.15.0"
}
```

**Note**: `versions.json` is out of sync and should be updated to include all released versions. Format is: `"plugin-version": "minimum-obsidian-version"`

### Updating versions.json

After updating to new version, the `npm run version` script should update this automatically:

```json
{
  "0.1.7": "0.15.0",
  "0.2.0": "0.15.0",
  "1.0.0": "0.15.0"
}
```

---

## Automated Scripts

### `npm run build`
- Compiles TypeScript → JavaScript
- Bundles code with esbuild
- Validates TypeScript (skipLibCheck)
- Copies to `.obsidian/plugins/smartwrite-publisher/`
- Outputs: `main.js`, `manifest.json`, `styles.css`

### `npm run version`
- Reads version from `package.json`
- Updates `manifest.json` to match
- Updates `versions.json` with minAppVersion

### `npm run lint`
- Runs ESLint check
- Reports violations
- Some issues auto-fixable with `--fix`

### `npm run dev`
- Starts development watch mode
- Automatically rebuilds on file changes
- Useful for iterative development

---

## Complete Example: Updating from 0.1.7 → 0.1.8

```bash
#!/bin/bash
cd smartwrite_publisher

# 1. Update versions
sed -i '' 's/"0.1.7"/"0.1.8"/g' package.json manifest.json

# 2. Add changelog entry
cat >> CHANGELOG.md << 'EOF'

## [0.1.8] - 2026-01-29

### Fixed
- Fixed ESLint violations and type safety issues
- Fixed command ID naming convention

EOF

# 3. Build
npm run build

# 4. Commit
git add package.json manifest.json versions.json CHANGELOG.md
git commit -m "[Fix]: Code quality improvements - v0.1.8"

# 5. Tag
git tag -a 0.1.8 -m "SmartWrite Publisher v0.1.8"

# 6. Push
git push origin main
git push origin 0.1.8

# 7. Create GitHub Release (manual step)
echo "Create GitHub release at: https://github.com/zandercpzed/smartwrite-publisher/releases/new?tag=0.1.8"
```

---

## Pre-Release Checklist

Before releasing any version:

- [ ] All ESLint errors resolved (or explicitly disabled with comments)
- [ ] TypeScript compilation passes
- [ ] Plugin builds without errors
- [ ] Plugin loads in test vault without errors
- [ ] All features tested in Obsidian
- [ ] CHANGELOG.md updated with all changes
- [ ] Version synchronized across all files
- [ ] FEATURES.md updated if status changed
- [ ] No uncommitted changes in git
- [ ] Latest commit message follows convention

---

## Obsidian Community Plugin Submission Requirements

For submitting to [obsidian-releases](https://github.com/obsidianmd/obsidian-releases):

1. ✅ Plugin follows all ESLint guidelines
2. ✅ manifest.json properly formatted
3. ✅ versions.json includes all releases
4. ✅ minAppVersion specified correctly
5. ✅ Plugin name follows guidelines (no "Obsidian", doesn't end with "Plugin")
6. ✅ Description doesn't mention "Obsidian" or "This plugin"
7. ✅ GitHub repository public
8. ✅ LICENSE file included
9. ✅ main.js, manifest.json, styles.css included in release
10. ✅ Tested on multiple platforms

---

## Troubleshooting

### Version Mismatch Error

```bash
# If versions don't match:
cd smartwrite_publisher

# Check current versions
grep version package.json
grep version manifest.json

# Manually sync them to same value
# Then run version script
npm run version
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules main.js
npm install
npm run build
```

### Plugin Doesn't Load in Obsidian

```bash
# 1. Check console for errors
#    Developer Tools: Cmd+Opt+I → Console tab

# 2. Check main.js exists
ls -lh .obsidian/plugins/smartwrite-publisher/main.js

# 3. Restart Obsidian or reload plugin
# 4. Check manifest.json is valid JSON
npm run lint
```

---

## FAQ

**Q: What's the difference between `npm run build` and `npm run dev`?**
A: `build` creates production code (minified, copied to vault). `dev` watches for changes and rebuilds automatically.

**Q: Do I need to manually update versions.json?**
A: No, `npm run version` should handle it automatically.

**Q: When should I use git tags?**
A: Always tag version releases for GitHub releases and Obsidian submission.

**Q: Can I revert a version?**
A: Yes, use `git revert <commit>` for published commits, or `git reset --soft HEAD~1` for unpushed commits.

**Q: What if I made a mistake in the CHANGELOG?**
A: Amend the commit: `git commit --amend` and force push if already pushed.

---

## Resources

- **Obsidian Plugin Guidelines**: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- **Semantic Versioning**: https://semver.org/
- **Git Tagging**: https://git-scm.com/book/en/v2/Git-Basics-Tagging
- **Plugin Submission**: https://github.com/obsidianmd/obsidian-releases

---

**Document Version**: 1.0
**Project**: SmartWrite Publisher
**Repository**: https://github.com/zandercpzed/smartwrite-publisher

_Follow these procedures to maintain consistent versioning and successful plugin releases._
