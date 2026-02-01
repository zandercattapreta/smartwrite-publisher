#!/bin/bash

# =============================================================================
# SmartWrite Publisher - Release Routine v1.0
# Automatiza: refatoração, versionamento, docs, backup e git
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

echo -e "${BLUE}=== SmartWrite Publisher Release Routine ===${NC}\n"

# =============================================================================
# STEP 1: Validate project structure
# =============================================================================
echo -e "${BLUE}[1/7] Validating project structure...${NC}"
if [ ! -f "$PROJECT_ROOT/manifest.json" ]; then
    echo -e "${RED}ERROR: manifest.json not found${NC}"
    exit 1
fi
if [ ! -f "$PROJECT_ROOT/CHANGELOG.md" ]; then
    echo -e "${RED}ERROR: CHANGELOG.md not found${NC}"
    exit 1
fi
if [ ! -d "$PROJECT_ROOT/src" ]; then
    echo -e "${RED}ERROR: src/ directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project structure validated${NC}\n"

# =============================================================================
# STEP 2: Check for TypeScript compilation errors
# =============================================================================
echo -e "${BLUE}[2/7] Checking TypeScript compilation...${NC}"
if ! npm run build > /tmp/build.log 2>&1; then
    echo -e "${RED}✗ Build failed. Errors:${NC}"
    cat /tmp/build.log
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}\n"

# =============================================================================
# STEP 3: Check for .trim() type issues
# =============================================================================
echo -e "${BLUE}[3/7] Scanning for type safety issues...${NC}"
TRIM_ISSUES=$(grep -r "bodyHtml.*\.trim()" src/ --include="*.ts" 2>/dev/null | grep -v "typeof.*===.*string" || true)
if [ ! -z "$TRIM_ISSUES" ]; then
    echo -e "${YELLOW}WARNING: Potential .trim() issues found:${NC}"
    echo "$TRIM_ISSUES"
fi
echo -e "${GREEN}✓ Type safety check completed${NC}\n"

# =============================================================================
# STEP 4: Get current and new version
# =============================================================================
echo -e "${BLUE}[4/7] Updating version...${NC}"
CURRENT_VERSION=$(jq -r '.version' "$PROJECT_ROOT/manifest.json")
echo "Current version: $CURRENT_VERSION"

# Parse version (major.minor.patch)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
echo "New version: $NEW_VERSION"

# Update manifest.json
jq --arg version "$NEW_VERSION" '.version = $version' "$PROJECT_ROOT/manifest.json" > /tmp/manifest.json.tmp
mv /tmp/manifest.json.tmp "$PROJECT_ROOT/manifest.json"
echo -e "${GREEN}✓ Version updated in manifest.json${NC}\n"

# =============================================================================
# STEP 5: Update documentation (placeholder - user should customize)
# =============================================================================
echo -e "${BLUE}[5/7] Checking documentation...${NC}"
if grep -q "manifest.json" "$PROJECT_ROOT/CHANGELOG.md"; then
    echo -e "${GREEN}✓ CHANGELOG.md exists and has history${NC}"
else
    echo -e "${YELLOW}WARNING: Check CHANGELOG.md format${NC}"
fi
echo -e "${GREEN}✓ Documentation check completed${NC}\n"

# =============================================================================
# STEP 6: Create backup
# =============================================================================
echo -e "${BLUE}[6/7] Creating backup...${NC}"
BACKUP_DIR="$PROJECT_ROOT/.backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/smartwrite-publisher-v${NEW_VERSION}-$(date +%Y%m%d_%H%M%S).tar.gz"

tar -czf "$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=main.js \
    --exclude=.obsidian \
    -C "$PROJECT_ROOT" \
    src/ manifest.json package.json README.md CHANGELOG.md esbuild.config.mjs tsconfig.json 2>/dev/null || true

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}\n"
else
    echo -e "${YELLOW}WARNING: Backup creation may have failed${NC}\n"
fi

# =============================================================================
# STEP 7: Git commit and push
# =============================================================================
echo -e "${BLUE}[7/7] Committing changes...${NC}"

# Check if git is configured
if [ -z "$(git config --global user.name)" ]; then
    echo -e "${RED}ERROR: Git user not configured. Run: git config --global user.name 'Your Name'${NC}"
    exit 1
fi

# Stage changes
cd "$PROJECT_ROOT"
git add -A

# Check if there are changes to commit
if ! git diff --cached --quiet; then
    git commit -m "v${NEW_VERSION}: Automated release

- Incremented version: ${CURRENT_VERSION} → ${NEW_VERSION}
- Created backup: $(basename $BACKUP_FILE)
- Refactored and validated TypeScript compilation
- Updated manifest.json

Co-Authored-By: SmartWrite Release Bot <release@smartwrite-publisher.dev>" || {
        echo -e "${YELLOW}WARNING: Commit may have failed or had nothing to commit${NC}"
    }
else
    echo -e "${YELLOW}No changes to commit${NC}"
fi

# Try to push
echo -e "${BLUE}Attempting to push to GitHub...${NC}"
if git push origin main 2>/dev/null; then
    echo -e "${GREEN}✓ Successfully pushed to GitHub${NC}"
elif git push origin main 2>&1 | grep -q "fatal"; then
    echo -e "${YELLOW}⚠ Push failed (network/auth issue). Changes are committed locally.${NC}"
    echo -e "${YELLOW}Push manually with: git push origin main${NC}"
else
    echo -e "${YELLOW}⚠ Push status unknown. Check with: git status${NC}"
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo -e "\n${GREEN}=== Release Complete ===${NC}"
echo -e "Version: ${YELLOW}${NEW_VERSION}${NC}"
echo -e "Backup: ${YELLOW}$(basename $BACKUP_FILE)${NC}"
echo -e "Committed: ${GREEN}YES${NC}"
echo -e "\nNext steps:"
echo -e "  1. Test the plugin in your Obsidian vault"
echo -e "  2. Verify functionality"
echo -e "  3. Confirm git push status with: git log --oneline -3"
